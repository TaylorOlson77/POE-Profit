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
  detailsFromZod,
  formDetailPath,
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
    unitCostChaos: line.unitCostChaos,
    modifierNotes: line.modifierNotes ?? "",
    savedLineTotalChaos: line.lineTotalChaos,
  }));
}

function emptyLine(): LineState {
  return {
    key: crypto.randomUUID(),
    name: "",
    quantity: "",
    unitCostChaos: "",
    modifierNotes: "",
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
  return /^(name|game|description|mapNotes|mapUnitCostChaos|enhancementLines\.\d+\.(name|quantity|unitCostChaos|modifierNotes))$/.test(
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
  const [description, setDescription] = useState("");
  const [mapNotes, setMapNotes] = useState("");
  const [mapUnitCostChaos, setMapUnitCostChaos] = useState("");
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
      setDescription(strategy.description);
      setMapNotes(strategy.mapNotes ?? "");
      setMapUnitCostChaos(strategy.mapUnitCostChaos);
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
    setDescription(strategy.description);
    setMapNotes(strategy.mapNotes ?? "");
    setMapUnitCostChaos(strategy.mapUnitCostChaos);
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
            if (next !== "POE2" && next !== "POE1") {
              return;
            }
            clearNotices();
            setGame(next);
          }}
        >
          <option value="POE2">Path of Exile 2</option>
          <option value="POE1">Path of Exile 1</option>
        </select>
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
            <TextField
              id={`${formId}-line-${line.key}-cost`}
              label={`Unit cost (chaos) ${index + 1}`}
              value={line.unitCostChaos}
              inputMode="decimal"
              error={messageFor(
                details,
                `enhancementLines.${index}.unitCostChaos`,
              )}
              onChange={(value) =>
                updateLine(line.key, { unitCostChaos: value })
              }
            />
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
            setLines((current) => [...current, emptyLine()]);
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
  inputMode?: "decimal";
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
