"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import type { ApiErrorDetail } from "@/src/contracts/errors";
import {
  CreateMapSessionBodySchema,
  MAX_MAP_SESSION_INVESTMENT_LINES,
  MAX_MAP_SESSION_REVENUE_LINES,
  type DurationMethod,
  type MapSession,
  type MapSessionInvestmentLine,
  type MapSessionRevenueLine,
} from "@/src/contracts/mapSessions";
import type { Strategy } from "@/src/contracts/strategies";
import { formatChaos, formatChaosOrNA } from "@/src/ui/formatChaos";
import {
  formatDuration,
  formatDurationMinutes,
  formatPercentOrNA,
  formatPlainOrNA,
} from "@/src/ui/formatDuration";
import {
  buildMapSessionWriteBody,
  formDetailPath,
  isoToLocalDateTime,
  sessionDraftSignature,
  type InvestmentLineDraft,
  type MapSessionFormDraft,
  type RevenueLineDraft,
} from "@/src/ui/mapSessionForm";
import {
  categoryOptions,
  DEFAULT_REVENUE_CATEGORY,
} from "@/src/ui/revenueCategories";
import { strategyLabels } from "@/src/ui/strategyLabels";
import { detailsFromZod } from "@/src/ui/strategyForm";
import { fetchStrategies } from "../strategies/api";
import { createMapSession, fetchMapSession, updateMapSession } from "./api";

const inputClass =
  "mt-1 w-full rounded border border-current/20 bg-transparent px-3 py-2";
const cellInputClass =
  "w-full min-w-28 rounded border border-current/20 bg-transparent px-2 py-1.5";
const buttonClass =
  "rounded border border-current/30 px-3 py-1.5 text-sm hover:bg-current/5 disabled:opacity-50";

type InvestmentLineState = InvestmentLineDraft & {
  key: string;
  savedLineTotalChaos: string | null;
};

type RevenueLineState = RevenueLineDraft & {
  key: string;
  savedLineTotalChaos: string | null;
};

type FormError = {
  message: string;
  details: ApiErrorDetail[];
};

function emptyInvestment(key: string): InvestmentLineState {
  return {
    key,
    name: "",
    quantity: "",
    unitValueChaos: "",
    priceRecordedAt: null,
    savedUnitValueChaos: null,
    savedLineTotalChaos: null,
  };
}

function emptyRevenue(key: string): RevenueLineState {
  return {
    ...emptyInvestment(key),
    category: DEFAULT_REVENUE_CATEGORY,
  };
}

function investmentFromSession(
  line: MapSessionInvestmentLine,
): InvestmentLineState {
  return {
    key: line.id,
    name: line.name,
    quantity: line.quantity,
    unitValueChaos: line.unitValueChaos,
    priceRecordedAt: line.priceRecordedAt,
    savedUnitValueChaos: line.unitValueChaos,
    savedLineTotalChaos: line.lineTotalChaos,
  };
}

function revenueFromSession(line: MapSessionRevenueLine): RevenueLineState {
  return {
    ...investmentFromSession(line),
    category: line.category,
  };
}

function draftFromSession(session: MapSession): {
  draft: MapSessionFormDraft;
  investmentLines: InvestmentLineState[];
  revenueLines: RevenueLineState[];
} {
  const investmentLines = session.investmentLines.map(investmentFromSession);
  const revenueLines = session.revenueLines.map(revenueFromSession);
  const duration = {
    sampleMapsCompleted: "",
    sampleDurationMinutes: "",
    startedAtLocal: "",
    endedAtLocal: "",
    manualDurationMinutes: "",
  };
  if (session.durationMethod === "EXTRAPOLATED") {
    duration.sampleMapsCompleted = String(session.sampleMapsCompleted);
    duration.sampleDurationMinutes = session.sampleDurationMinutes;
  } else if (session.durationMethod === "OBSERVED") {
    duration.startedAtLocal = isoToLocalDateTime(session.startedAt);
    duration.endedAtLocal = isoToLocalDateTime(session.endedAt);
  } else {
    duration.manualDurationMinutes = session.manualDurationMinutes;
  }

  return {
    investmentLines,
    revenueLines,
    draft: {
      strategyId: session.strategyId,
      mapsCompleted: String(session.mapsCompleted),
      mapUnitCostChaos: session.mapUnitCostChaos,
      divineRateChaos: session.divineRateChaos,
      notes: session.notes ?? "",
      durationMethod: session.durationMethod,
      ...duration,
      investmentLines,
      revenueLines,
    },
  };
}

function messageFor(
  details: ApiErrorDetail[],
  path: string,
): string | undefined {
  return details.find((detail) => detail.path === path)?.message;
}

function isShownOnField(path: string): boolean {
  return /^(strategyId|mapsCompleted|mapUnitCostChaos|divineRateChaos|notes|sampleMapsCompleted|sampleDurationMinutes|startedAt|endedAt|manualDurationMinutes|investmentLines\.\d+\.(name|quantity|unitValueChaos)|revenueLines\.\d+\.(category|name|quantity|unitValueChaos))$/.test(
    path,
  );
}

function formatRecordedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function asDurationMethod(value: string): DurationMethod | null {
  if (value === "EXTRAPOLATED" || value === "OBSERVED" || value === "MANUAL") {
    return value;
  }
  return null;
}

export function SessionForm(
  props:
    | { mode: "create"; initialStrategyId?: string }
    | { mode: "edit"; sessionId: string },
) {
  const router = useRouter();
  const formId = useId();
  const sessionId = props.mode === "edit" ? props.sessionId : null;
  const initialStrategyId =
    props.mode === "create" ? props.initialStrategyId : undefined;

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [strategyId, setStrategyId] = useState("");
  const [mapsCompleted, setMapsCompleted] = useState("");
  const [mapUnitCostChaos, setMapUnitCostChaos] = useState("");
  const [divineRateChaos, setDivineRateChaos] = useState("");
  const [notes, setNotes] = useState("");
  const [durationMethod, setDurationMethod] =
    useState<DurationMethod>("EXTRAPOLATED");
  const [sampleMapsCompleted, setSampleMapsCompleted] = useState("");
  const [sampleDurationMinutes, setSampleDurationMinutes] = useState("");
  const [startedAtLocal, setStartedAtLocal] = useState("");
  const [endedAtLocal, setEndedAtLocal] = useState("");
  const [manualDurationMinutes, setManualDurationMinutes] = useState("");
  const [investmentLines, setInvestmentLines] = useState<InvestmentLineState[]>(
    () => (sessionId === null ? [emptyInvestment("new-investment")] : []),
  );
  const [revenueLines, setRevenueLines] = useState<RevenueLineState[]>(() =>
    sessionId === null ? [emptyRevenue("new-revenue")] : [],
  );
  const [saved, setSaved] = useState<MapSession | null>(null);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [formError, setFormError] = useState<FormError | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  function applySession(session: MapSession) {
    const next = draftFromSession(session);
    setStrategyId(next.draft.strategyId);
    setMapsCompleted(next.draft.mapsCompleted);
    setMapUnitCostChaos(next.draft.mapUnitCostChaos);
    setDivineRateChaos(next.draft.divineRateChaos);
    setNotes(next.draft.notes);
    setDurationMethod(next.draft.durationMethod);
    setSampleMapsCompleted(next.draft.sampleMapsCompleted);
    setSampleDurationMinutes(next.draft.sampleDurationMinutes);
    setStartedAtLocal(next.draft.startedAtLocal);
    setEndedAtLocal(next.draft.endedAtLocal);
    setManualDurationMinutes(next.draft.manualDurationMinutes);
    setInvestmentLines(next.investmentLines);
    setRevenueLines(next.revenueLines);
    setSaved(session);
    setSavedSignature(sessionDraftSignature(next.draft));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const strategyResult = await fetchStrategies();
      if (cancelled) {
        return;
      }
      if (!strategyResult.ok) {
        setLoadError(strategyResult.error.message);
        setReady(false);
        return;
      }

      if (sessionId === null) {
        const match = strategyResult.data.find(
          (strategy) => strategy.id === initialStrategyId,
        );
        if (match) {
          setStrategyId(match.id);
          setMapUnitCostChaos(match.mapUnitCostChaos);
        }
        setStrategies(strategyResult.data);
        setReady(true);
        return;
      }

      const sessionResult = await fetchMapSession(sessionId);
      if (cancelled) {
        return;
      }
      if (!sessionResult.ok) {
        setLoadError(sessionResult.error.message);
        setReady(false);
        return;
      }
      setStrategies(strategyResult.data);
      applySession(sessionResult.data);
      setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, initialStrategyId]);

  function clearNotices() {
    setFormError(null);
    setSavedNotice(null);
  }

  function currentDraft(): MapSessionFormDraft {
    return {
      strategyId,
      mapsCompleted,
      mapUnitCostChaos,
      divineRateChaos,
      notes,
      durationMethod,
      sampleMapsCompleted,
      sampleDurationMinutes,
      startedAtLocal,
      endedAtLocal,
      manualDurationMinutes,
      investmentLines,
      revenueLines,
    };
  }

  function onStrategyChange(nextId: string) {
    clearNotices();
    setStrategyId(nextId);
    const match = strategies.find((strategy) => strategy.id === nextId);
    if (match) {
      setMapUnitCostChaos(match.mapUnitCostChaos);
    }
  }

  function updateInvestment(key: string, patch: Partial<InvestmentLineDraft>) {
    clearNotices();
    setInvestmentLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function updateRevenue(key: string, patch: Partial<RevenueLineDraft>) {
    clearNotices();
    setRevenueLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) {
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setFormError(null);
    setSavedNotice(null);

    try {
      const built = buildMapSessionWriteBody(currentDraft());
      const parsed = CreateMapSessionBodySchema.safeParse(built.body);
      const covered = new Set(built.fieldErrors.map((detail) => detail.path));
      const zodDetails = parsed.success
        ? []
        : detailsFromZod(parsed.error)
            .map((detail) => ({
              ...detail,
              path: formDetailPath(
                detail.path,
                built.submittedInvestmentIndexes,
                built.submittedRevenueIndexes,
              ),
            }))
            .filter((detail) => !covered.has(detail.path));
      const details = [...built.fieldErrors, ...zodDetails];
      if (!parsed.success) {
        setFormError({ message: "Invalid map session payload", details });
        return;
      }

      const result =
        sessionId === null
          ? await createMapSession(parsed.data)
          : await updateMapSession(sessionId, parsed.data);
      if (!result.ok) {
        setFormError({
          message: result.error.message,
          details: result.error.details.map((detail) => ({
            ...detail,
            path: formDetailPath(
              detail.path,
              built.submittedInvestmentIndexes,
              built.submittedRevenueIndexes,
            ),
          })),
        });
        return;
      }
      if (sessionId === null) {
        router.replace(`/sessions/${result.data.id}`);
        return;
      }
      applySession(result.data);
      setSavedNotice("Saved.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (!ready && loadError === null) {
    return <p>Loading session…</p>;
  }

  if (loadError !== null) {
    return (
      <div className="flex flex-col items-start gap-3" role="alert">
        <p>{loadError}</p>
        <Link href="/sessions" className="underline">
          Back to sessions
        </Link>
      </div>
    );
  }

  if (sessionId === null && strategies.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p>Create a strategy before logging a session.</p>
        <Link href="/strategies/new" className="underline">
          New strategy
        </Link>
      </div>
    );
  }

  const selected =
    strategies.find((strategy) => strategy.id === strategyId) ?? null;
  const labels = strategyLabels(selected?.game ?? "POE2");
  const knownStrategy =
    strategyId === "" ||
    strategies.some((strategy) => strategy.id === strategyId);
  const details = formError?.details ?? [];
  const extraDetails = details.filter((detail) => !isShownOnField(detail.path));
  const dirty =
    savedSignature !== null &&
    sessionDraftSignature(currentDraft()) !== savedSignature;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => void onSubmit(event)}
      autoComplete="off"
    >
      {formError !== null ? (
        <div role="alert" className="flex flex-col gap-1">
          <p>{formError.message}</p>
          {extraDetails.length > 0 ? (
            <ul className="list-disc pl-5 text-sm">
              {extraDetails.map((detail) => (
                <li key={`${detail.path}:${detail.message}`}>
                  {detail.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {savedNotice !== null ? <p role="status">{savedNotice}</p> : null}
      {dirty ? (
        <p className="text-sm" role="status">
          Unsaved changes. Totals below are from the last save.
        </p>
      ) : null}

      <div className="flex flex-col">
        <label htmlFor={`${formId}-strategy`}>Strategy</label>
        <select
          id={`${formId}-strategy`}
          className={inputClass}
          value={strategyId}
          onChange={(event) => onStrategyChange(event.target.value)}
        >
          <option value="">Select a strategy</option>
          {!knownStrategy ? (
            <option value={strategyId}>Unknown strategy</option>
          ) : null}
          {strategies.map((strategy) => (
            <option key={strategy.id} value={strategy.id}>
              {strategy.name}
            </option>
          ))}
        </select>
        {messageFor(details, "strategyId") ? (
          <p className="mt-1 text-sm">{messageFor(details, "strategyId")}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${formId}-maps`}
          label={`${labels.mapsNoun} completed`}
          value={mapsCompleted}
          inputMode="numeric"
          error={messageFor(details, "mapsCompleted")}
          onChange={(value) => {
            clearNotices();
            setMapsCompleted(value);
          }}
        />
        <TextField
          id={`${formId}-map-cost`}
          label={labels.mapCost}
          value={mapUnitCostChaos}
          inputMode="decimal"
          error={messageFor(details, "mapUnitCostChaos")}
          onChange={(value) => {
            clearNotices();
            setMapUnitCostChaos(value);
          }}
        />
        <TextField
          id={`${formId}-divine`}
          label="Divine rate (chaos per divine)"
          value={divineRateChaos}
          inputMode="decimal"
          hint="Captured with this session."
          error={messageFor(details, "divineRateChaos")}
          onChange={(value) => {
            clearNotices();
            setDivineRateChaos(value);
          }}
        />
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-medium">Duration method</legend>
        <div className="flex flex-col">
          <label htmlFor={`${formId}-method`}>Method</label>
          <select
            id={`${formId}-method`}
            className={inputClass}
            value={durationMethod}
            onChange={(event) => {
              const next = asDurationMethod(event.target.value);
              if (next === null) {
                return;
              }
              clearNotices();
              setDurationMethod(next);
            }}
          >
            <option value="EXTRAPOLATED">Extrapolated</option>
            <option value="OBSERVED">Observed</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
        {durationMethod === "EXTRAPOLATED" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`${formId}-sample-maps`}
              label={`Sample ${labels.mapsNoun.toLowerCase()}`}
              value={sampleMapsCompleted}
              inputMode="numeric"
              error={messageFor(details, "sampleMapsCompleted")}
              onChange={(value) => {
                clearNotices();
                setSampleMapsCompleted(value);
              }}
            />
            <TextField
              id={`${formId}-sample-minutes`}
              label="Sample minutes"
              value={sampleDurationMinutes}
              inputMode="decimal"
              error={messageFor(details, "sampleDurationMinutes")}
              onChange={(value) => {
                clearNotices();
                setSampleDurationMinutes(value);
              }}
            />
          </div>
        ) : null}
        {durationMethod === "OBSERVED" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`${formId}-started`}
              label="Started"
              type="datetime-local"
              value={startedAtLocal}
              error={messageFor(details, "startedAt")}
              onChange={(value) => {
                clearNotices();
                setStartedAtLocal(value);
              }}
            />
            <TextField
              id={`${formId}-ended`}
              label="Ended"
              type="datetime-local"
              value={endedAtLocal}
              error={messageFor(details, "endedAt")}
              onChange={(value) => {
                clearNotices();
                setEndedAtLocal(value);
              }}
            />
          </div>
        ) : null}
        {durationMethod === "MANUAL" ? (
          <TextField
            id={`${formId}-manual`}
            label="Duration (minutes)"
            value={manualDurationMinutes}
            inputMode="decimal"
            error={messageFor(details, "manualDurationMinutes")}
            onChange={(value) => {
              clearNotices();
              setManualDurationMinutes(value);
            }}
          />
        ) : null}
      </fieldset>

      <TextField
        id={`${formId}-notes`}
        label="Notes"
        value={notes}
        multiline
        error={messageFor(details, "notes")}
        onChange={(value) => {
          clearNotices();
          setNotes(value);
        }}
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="font-medium">Investment</legend>
        <p className="text-sm opacity-70">
          {labels.mapNoun} cost is recorded above, not as a line. Prices are
          manual snapshots.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-current/20 text-left">
                <th className="px-2 py-2 font-medium" scope="col">
                  Item
                </th>
                <th className="px-2 py-2 font-medium" scope="col">
                  Qty
                </th>
                <th className="px-2 py-2 font-medium" scope="col">
                  Unit
                </th>
                <th className="px-2 py-2 font-medium" scope="col">
                  Total
                </th>
                <th className="px-2 py-2 font-medium" scope="col">
                  Recorded
                </th>
                <th className="px-2 py-2 font-medium" scope="col">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {investmentLines.map((line, index) => (
                <tr key={line.key} className="border-b border-current/10">
                  <td className="px-2 py-2 align-top">
                    <CellInput
                      id={`${formId}-inv-${line.key}-name`}
                      label={`Investment item ${index + 1}`}
                      value={line.name}
                      error={messageFor(
                        details,
                        `investmentLines.${index}.name`,
                      )}
                      onChange={(value) =>
                        updateInvestment(line.key, { name: value })
                      }
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <CellInput
                      id={`${formId}-inv-${line.key}-qty`}
                      label={`Investment quantity ${index + 1}`}
                      value={line.quantity}
                      inputMode="decimal"
                      error={messageFor(
                        details,
                        `investmentLines.${index}.quantity`,
                      )}
                      onChange={(value) =>
                        updateInvestment(line.key, { quantity: value })
                      }
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <CellInput
                      id={`${formId}-inv-${line.key}-unit`}
                      label={`Investment unit value ${index + 1}`}
                      value={line.unitValueChaos}
                      inputMode="decimal"
                      error={messageFor(
                        details,
                        `investmentLines.${index}.unitValueChaos`,
                      )}
                      onChange={(value) =>
                        updateInvestment(line.key, { unitValueChaos: value })
                      }
                    />
                  </td>
                  <td className="px-2 py-2 align-top whitespace-nowrap">
                    {line.savedLineTotalChaos === null
                      ? "—"
                      : formatChaos(line.savedLineTotalChaos)}
                  </td>
                  <td className="px-2 py-2 align-top whitespace-nowrap">
                    {line.priceRecordedAt === null
                      ? "—"
                      : formatRecordedAt(line.priceRecordedAt)}
                  </td>
                  <td className="px-2 py-2 align-top">
                    <button
                      type="button"
                      className={buttonClass}
                      onClick={() => {
                        clearNotices();
                        setInvestmentLines((current) =>
                          current.filter((item) => item.key !== line.key),
                        );
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {saved !== null ? (
          <p className="text-sm">
            {labels.mapNoun} investment: {formatChaos(saved.mapInvestmentChaos)}
          </p>
        ) : null}
        <button
          type="button"
          className={buttonClass}
          disabled={investmentLines.length >= MAX_MAP_SESSION_INVESTMENT_LINES}
          onClick={() => {
            clearNotices();
            setInvestmentLines((current) => [
              ...current,
              emptyInvestment(crypto.randomUUID()),
            ]);
          }}
        >
          Add investment
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-medium">Revenue</legend>
        <p className="text-sm opacity-70">Prices are manual snapshots.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-current/20 text-left">
                <th className="px-2 py-2 font-medium" scope="col">
                  Category
                </th>
                <th className="px-2 py-2 font-medium" scope="col">
                  Item
                </th>
                <th className="px-2 py-2 font-medium" scope="col">
                  Qty
                </th>
                <th className="px-2 py-2 font-medium" scope="col">
                  Unit
                </th>
                <th className="px-2 py-2 font-medium" scope="col">
                  Total
                </th>
                <th className="px-2 py-2 font-medium" scope="col">
                  Recorded
                </th>
                <th className="px-2 py-2 font-medium" scope="col">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {revenueLines.map((line, index) => (
                <tr key={line.key} className="border-b border-current/10">
                  <td className="px-2 py-2 align-top">
                    <select
                      id={`${formId}-rev-${line.key}-category`}
                      aria-label={`Revenue category ${index + 1}`}
                      className={cellInputClass}
                      value={line.category}
                      onChange={(event) =>
                        updateRevenue(line.key, {
                          category: event.target.value,
                        })
                      }
                    >
                      {categoryOptions(line.category).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {messageFor(details, `revenueLines.${index}.category`) ? (
                      <p className="mt-1 text-xs">
                        {messageFor(details, `revenueLines.${index}.category`)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-2 py-2 align-top">
                    <CellInput
                      id={`${formId}-rev-${line.key}-name`}
                      label={`Revenue item ${index + 1}`}
                      value={line.name}
                      error={messageFor(details, `revenueLines.${index}.name`)}
                      onChange={(value) =>
                        updateRevenue(line.key, { name: value })
                      }
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <CellInput
                      id={`${formId}-rev-${line.key}-qty`}
                      label={`Revenue quantity ${index + 1}`}
                      value={line.quantity}
                      inputMode="decimal"
                      error={messageFor(
                        details,
                        `revenueLines.${index}.quantity`,
                      )}
                      onChange={(value) =>
                        updateRevenue(line.key, { quantity: value })
                      }
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <CellInput
                      id={`${formId}-rev-${line.key}-unit`}
                      label={`Revenue unit value ${index + 1}`}
                      value={line.unitValueChaos}
                      inputMode="decimal"
                      error={messageFor(
                        details,
                        `revenueLines.${index}.unitValueChaos`,
                      )}
                      onChange={(value) =>
                        updateRevenue(line.key, { unitValueChaos: value })
                      }
                    />
                  </td>
                  <td className="px-2 py-2 align-top whitespace-nowrap">
                    {line.savedLineTotalChaos === null
                      ? "—"
                      : formatChaos(line.savedLineTotalChaos)}
                  </td>
                  <td className="px-2 py-2 align-top whitespace-nowrap">
                    {line.priceRecordedAt === null
                      ? "—"
                      : formatRecordedAt(line.priceRecordedAt)}
                  </td>
                  <td className="px-2 py-2 align-top">
                    <button
                      type="button"
                      className={buttonClass}
                      onClick={() => {
                        clearNotices();
                        setRevenueLines((current) =>
                          current.filter((item) => item.key !== line.key),
                        );
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className={buttonClass}
          disabled={revenueLines.length >= MAX_MAP_SESSION_REVENUE_LINES}
          onClick={() => {
            clearNotices();
            setRevenueLines((current) => [
              ...current,
              emptyRevenue(crypto.randomUUID()),
            ]);
          }}
        >
          Add revenue
        </button>
      </fieldset>

      {saved === null ? (
        <p className="text-sm opacity-70">Totals appear after you save.</p>
      ) : (
        <section className="flex flex-col gap-2 text-sm">
          <h2 className="text-base font-medium">Performance</h2>
          <dl className="flex flex-col gap-y-1">
            <PerformanceTerm term="Duration method">
              {saved.durationMethodLabel}
            </PerformanceTerm>
            <PerformanceTerm term="Effective duration">
              {formatDuration(saved.effectiveDurationMinutes)} (
              {formatDurationMinutes(saved.effectiveDurationMinutes)})
            </PerformanceTerm>
            <PerformanceTerm term="Total revenue">
              {formatChaos(saved.totalRevenueChaos)}
            </PerformanceTerm>
            <PerformanceTerm term="Total investment">
              {formatChaos(saved.totalInvestmentChaos)}
            </PerformanceTerm>
            <PerformanceTerm term="Profit">
              {formatChaos(saved.profitChaos)}
            </PerformanceTerm>
            <PerformanceTerm term="Profit (divine)">
              {saved.profitDivineApprox === null
                ? "N/A"
                : `≈ ${formatPlainOrNA(saved.profitDivineApprox)} Divine`}
            </PerformanceTerm>
            <PerformanceTerm term="Profit / hour">
              {formatChaosOrNA(saved.profitPerHourChaos)}
            </PerformanceTerm>
            <PerformanceTerm term={`Profit / ${labels.mapNoun.toLowerCase()}`}>
              {formatChaosOrNA(saved.profitPerMapChaos)}
            </PerformanceTerm>
            <PerformanceTerm term={`${labels.mapsNoun} / hour`}>
              {formatPlainOrNA(saved.mapsPerHour)}
            </PerformanceTerm>
            <PerformanceTerm term="ROI">
              {formatPercentOrNA(saved.roiPercent)}
            </PerformanceTerm>
          </dl>
        </section>
      )}

      <button type="submit" className={buttonClass} disabled={saving}>
        Save session
      </button>
    </form>
  );
}

function PerformanceTerm({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4">
      <dt>{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  multiline = false,
  inputMode,
  hint,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  multiline?: boolean;
  inputMode?: "decimal" | "numeric";
  hint?: string;
  type?: "text" | "datetime-local";
}) {
  const errorId = `${id}-error`;
  const shared = {
    id,
    className: inputClass,
    value,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea {...shared} rows={3} />
      ) : (
        <input {...shared} type={type} inputMode={inputMode} />
      )}
      {hint ? <p className="mt-1 text-sm opacity-70">{hint}</p> : null}
      {error ? (
        <p id={errorId} className="mt-1 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CellInput({
  id,
  label,
  value,
  onChange,
  error,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  inputMode?: "decimal" | "numeric";
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col">
      <input
        id={id}
        aria-label={label}
        className={cellInputClass}
        value={value}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
