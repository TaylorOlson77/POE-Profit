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
} from "react";
import type { ApiErrorDetail } from "@/src/contracts/errors";
import {
  CreateStrategyBodySchema,
  MAX_STRATEGY_ENHANCEMENT_LINES,
  type Game,
  type Strategy,
} from "@/src/contracts/strategies";
import { formatChaos } from "@/src/ui/formatChaos";
import {
  buildStrategyWriteBody,
  DEFAULT_TABLET_USES,
  detailsFromZod,
  formDetailPath,
  gameChangeNeedsConfirm,
  gameChangePrompt,
  type EnhancementLineDraft,
} from "@/src/ui/strategyForm";
import { strategyLabels } from "@/src/ui/strategyLabels";
import { createStrategy, fetchStrategy, updateStrategy } from "./api";

const inputClass =
  "mt-1 w-full rounded border border-current/20 bg-transparent px-3 py-2";
const buttonClass =
  "rounded border border-current/30 px-3 py-1.5 text-sm hover:bg-current/5 disabled:opacity-50";

type LineState = EnhancementLineDraft & {
  key: string;
  savedLineTotalChaos: string | null;
};

type FormError = {
  message: string;
  details: ApiErrorDetail[];
};

function linesFromStrategy(strategy: Strategy): LineState[] {
  return strategy.enhancementLines.map((line) => ({
    key: line.id,
    name: line.name,
    quantity: line.quantity,
    userCostInput: line.userCostInput,
    currency: line.currency,
    modifierNotes: line.modifierNotes ?? "",
    uses: String(line.uses),
    savedLineTotalChaos: line.lineTotalChaos,
  }));
}

function emptyLine(game: Game): LineState {
  return {
    key: crypto.randomUUID(),
    name: "",
    quantity: "",
    userCostInput: "",
    currency: "CHAOS",
    modifierNotes: "",
    uses: game === "POE2" ? DEFAULT_TABLET_USES : "1",
    savedLineTotalChaos: null,
  };
}

function messageFor(
  details: ApiErrorDetail[],
  path: string,
): string | undefined {
  return details.find((detail) => detail.path === path)?.message;
}

function isShownOnField(path: string): boolean {
  return /^(name|game|description|mapNotes|mapUnitCostChaos|divineRateChaos|enhancementLines\.\d+\.(name|quantity|userCostInput|currency|modifierNotes|uses))$/.test(
    path,
  );
}

export function StrategyForm(
  props: { mode: "create" } | { mode: "edit"; strategyId: string },
) {
  const router = useRouter();
  const formId = useId();
  const strategyId = props.mode === "edit" ? props.strategyId : null;

  const [ready, setReady] = useState(props.mode === "create");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [game, setGame] = useState<Game>("POE2");
  const [pendingGame, setPendingGame] = useState<Game | null>(null);
  const [description, setDescription] = useState("");
  const [mapNotes, setMapNotes] = useState("");
  const [mapUnitCostChaos, setMapUnitCostChaos] = useState("");
  const [divineRateChaos, setDivineRateChaos] = useState("");
  const [lines, setLines] = useState<LineState[]>([]);
  const [savedEstimatedCost, setSavedEstimatedCost] = useState<string | null>(
    null,
  );
  const [formError, setFormError] = useState<FormError | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    if (strategyId === null) {
      return;
    }
    let cancelled = false;

    async function load(id: string) {
      const result = await fetchStrategy(id);
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setLoadError(result.error.message);
        setReady(false);
        return;
      }
      const strategy = result.data;
      setName(strategy.name);
      setGame(strategy.game);
      setPendingGame(null);
      setDescription(strategy.description);
      setMapNotes(strategy.mapNotes ?? "");
      setMapUnitCostChaos(strategy.mapUnitCostChaos);
      setDivineRateChaos(strategy.divineRateChaos ?? "");
      setLines(linesFromStrategy(strategy));
      setSavedEstimatedCost(strategy.estimatedCostPerMapChaos);
      setLoadError(null);
      setReady(true);
    }

    void load(strategyId);
    return () => {
      cancelled = true;
    };
  }, [strategyId]);

  function applySaved(strategy: Strategy) {
    setName(strategy.name);
    setGame(strategy.game);
    setPendingGame(null);
    setDescription(strategy.description);
    setMapNotes(strategy.mapNotes ?? "");
    setMapUnitCostChaos(strategy.mapUnitCostChaos);
    setDivineRateChaos(strategy.divineRateChaos ?? "");
    setLines(linesFromStrategy(strategy));
    setSavedEstimatedCost(strategy.estimatedCostPerMapChaos);
  }

  function clearNotices() {
    setFormError(null);
    setSavedNotice(null);
  }

  function updateLine(key: string, patch: Partial<EnhancementLineDraft>) {
    clearNotices();
    setLines((current) =>
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
      const { body, submittedLineIndexes } = buildStrategyWriteBody({
        name,
        game,
        description,
        mapNotes,
        mapUnitCostChaos,
        divineRateChaos,
        enhancementLines: lines,
      });
      const parsed = CreateStrategyBodySchema.safeParse(body);
      if (!parsed.success) {
        setFormError({
          message: "Invalid strategy payload",
          details: detailsFromZod(parsed.error).map((detail) => ({
            ...detail,
            path: formDetailPath(detail.path, submittedLineIndexes),
          })),
        });
        return;
      }

      const result =
        strategyId === null
          ? await createStrategy(parsed.data)
          : await updateStrategy(strategyId, parsed.data);
      if (!result.ok) {
        setFormError({
          message: result.error.message,
          details: result.error.details.map((detail) => ({
            ...detail,
            path: formDetailPath(detail.path, submittedLineIndexes),
          })),
        });
        return;
      }
      if (strategyId === null) {
        router.push("/");
        return;
      }
      applySaved(result.data);
      setSavedNotice("Saved.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (strategyId !== null && !ready && loadError === null) {
    return <p>Loading strategy…</p>;
  }

  if (loadError !== null) {
    return (
      <div className="flex flex-col items-start gap-3" role="alert">
        <p>{loadError}</p>
        <Link href="/" className="underline">
          Back to strategies
        </Link>
      </div>
    );
  }

  const labels = strategyLabels(game);
  const details = formError?.details ?? [];
  const extraDetails = details.filter((detail) => !isShownOnField(detail.path));

  return (
    <form
      className="flex flex-col gap-5"
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

      <TextField
        id={`${formId}-name`}
        label="Name"
        value={name}
        error={messageFor(details, "name")}
        onChange={(value) => {
          clearNotices();
          setName(value);
        }}
      />

      <div className="flex flex-col">
        <label htmlFor={`${formId}-game`}>Game</label>
        <select
          id={`${formId}-game`}
          className={inputClass}
          value={game}
          onChange={(event) => {
            const next = event.target.value;
            if ((next !== "POE2" && next !== "POE1") || next === game) {
              return;
            }
            clearNotices();
            if (!gameChangeNeedsConfirm(lines)) {
              setPendingGame(null);
              setGame(next);
              return;
            }
            setPendingGame(next);
          }}
        >
          <option value="POE2">Path of Exile 2</option>
          <option value="POE1">Path of Exile 1</option>
        </select>
        {pendingGame !== null ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-sm">{gameChangePrompt(game)}</p>
            <button
              type="button"
              className={buttonClass}
              onClick={() => {
                clearNotices();
                setGame(pendingGame);
                setLines([]);
                setPendingGame(null);
              }}
            >
              Confirm
            </button>
            <button
              type="button"
              className={buttonClass}
              onClick={() => setPendingGame(null)}
            >
              Cancel
            </button>
          </div>
        ) : null}
        {messageFor(details, "game") ? (
          <p className="mt-1 text-sm">{messageFor(details, "game")}</p>
        ) : null}
      </div>

      <TextField
        id={`${formId}-description`}
        label="Description"
        value={description}
        multiline
        error={messageFor(details, "description")}
        onChange={(value) => {
          clearNotices();
          setDescription(value);
        }}
      />

      <TextField
        id={`${formId}-map-notes`}
        label={labels.mapNotes}
        value={mapNotes}
        multiline
        error={messageFor(details, "mapNotes")}
        onChange={(value) => {
          clearNotices();
          setMapNotes(value);
        }}
      />

      <TextField
        id={`${formId}-map-cost`}
        label={labels.mapCost}
        value={mapUnitCostChaos}
        inputMode="decimal"
        hint="Quantity is always 1."
        error={messageFor(details, "mapUnitCostChaos")}
        onChange={(value) => {
          clearNotices();
          setMapUnitCostChaos(value);
        }}
      />

      <TextField
        id={`${formId}-divine-rate`}
        label="Divine rate (chaos per divine)"
        value={divineRateChaos}
        inputMode="decimal"
        hint="Required when a tablet or scarab cost is in divines."
        error={messageFor(details, "divineRateChaos")}
        onChange={(value) => {
          clearNotices();
          setDivineRateChaos(value);
        }}
      />

      <fieldset className="flex flex-col gap-4">
        <legend className="font-medium">{labels.enhancement}</legend>
        {lines.map((line, index) => (
          <div
            key={line.key}
            className="flex flex-col gap-3 rounded border border-current/15 p-3"
          >
            <TextField
              id={`${formId}-line-${line.key}-name`}
              label={`${labels.enhancementSingular} name ${index + 1}`}
              value={line.name}
              error={messageFor(details, `enhancementLines.${index}.name`)}
              onChange={(value) => updateLine(line.key, { name: value })}
            />
            <TextField
              id={`${formId}-line-${line.key}-qty`}
              label={`Quantity per map ${index + 1}`}
              value={line.quantity}
              inputMode="decimal"
              error={messageFor(details, `enhancementLines.${index}.quantity`)}
              onChange={(value) => updateLine(line.key, { quantity: value })}
            />
            <div className="flex flex-col">
              <label htmlFor={`${formId}-line-${line.key}-currency`}>
                Currency {index + 1}
              </label>
              <select
                id={`${formId}-line-${line.key}-currency`}
                className={inputClass}
                value={line.currency}
                onChange={(event) => {
                  const next = event.target.value;
                  if (next !== "CHAOS" && next !== "DIVINE") {
                    return;
                  }
                  updateLine(line.key, { currency: next });
                }}
              >
                <option value="CHAOS">Chaos</option>
                <option value="DIVINE">Divines</option>
              </select>
            </div>
            <TextField
              id={`${formId}-line-${line.key}-cost`}
              label={`Unit cost ${index + 1}`}
              value={line.userCostInput}
              inputMode="decimal"
              error={messageFor(
                details,
                `enhancementLines.${index}.userCostInput`,
              )}
              onChange={(value) =>
                updateLine(line.key, { userCostInput: value })
              }
            />
            {labels.showUses ? (
              <TextField
                id={`${formId}-line-${line.key}-uses`}
                label={`Uses ${index + 1}`}
                value={line.uses}
                inputMode="numeric"
                error={messageFor(details, `enhancementLines.${index}.uses`)}
                onChange={(value) => updateLine(line.key, { uses: value })}
              />
            ) : null}
            {labels.showModifierNotes ? (
              <TextField
                id={`${formId}-line-${line.key}-notes`}
                label={`Modifier notes ${index + 1}`}
                value={line.modifierNotes}
                error={messageFor(
                  details,
                  `enhancementLines.${index}.modifierNotes`,
                )}
                onChange={(value) =>
                  updateLine(line.key, { modifierNotes: value })
                }
              />
            ) : null}
            {line.savedLineTotalChaos !== null ? (
              <p className="text-sm">
                Saved total: {formatChaos(line.savedLineTotalChaos)}
              </p>
            ) : null}
            <button
              type="button"
              className={buttonClass}
              onClick={() => {
                clearNotices();
                setLines((current) =>
                  current.filter((item) => item.key !== line.key),
                );
              }}
            >
              Remove{" "}
              {line.name.trim() || labels.enhancementSingular.toLowerCase()}
            </button>
          </div>
        ))}
        <button
          type="button"
          className={buttonClass}
          disabled={lines.length >= MAX_STRATEGY_ENHANCEMENT_LINES}
          onClick={() => {
            clearNotices();
            setLines((current) => [...current, emptyLine(game)]);
          }}
        >
          Add {labels.enhancementSingular.toLowerCase()}
        </button>
      </fieldset>

      {savedEstimatedCost !== null ? (
        <div className="flex flex-col gap-1 text-sm">
          <p>
            {labels.costPer}: {formatChaos(savedEstimatedCost)}
          </p>
          <p className="opacity-70">Saved totals update when you save.</p>
        </div>
      ) : null}

      <button type="submit" className={buttonClass} disabled={saving}>
        Save strategy
      </button>
    </form>
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  multiline?: boolean;
  inputMode?: "decimal" | "numeric";
  hint?: string;
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
        <input {...shared} inputMode={inputMode} />
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
