import type { ApiErrorDetail } from "@/src/contracts/errors";
import type { Currency, Game } from "@/src/contracts/strategies";
import { strategyLabels } from "@/src/ui/strategyLabels";
import type { ZodError } from "zod";

/** Uses shown on a new PoE2 tablet row. */
export const DEFAULT_TABLET_USES = "10";

export type EnhancementLineDraft = {
  name: string;
  quantity: string;
  userCostInput: string;
  currency: Currency;
  modifierNotes: string;
  uses: string;
};

export type StrategyFormDraft = {
  name: string;
  game: Game;
  description: string;
  mapNotes: string;
  mapUnitCostChaos: string;
  divineRateChaos: string;
  enhancementLines: EnhancementLineDraft[];
};

export type StrategyWriteBody = {
  name: string;
  game: Game;
  description: string;
  mapNotes?: string;
  mapUnitCostChaos: string;
  divineRateChaos: string | null;
  enhancementLines: Array<{
    name: string;
    quantity: string;
    userCostInput: string;
    currency: Currency;
    uses: number;
    sortOrder: number;
    modifierNotes?: string;
  }>;
};

export type StrategyWriteDraftResult = {
  body: StrategyWriteBody;
  /** Form indexes of lines included in `body.enhancementLines`, in submit order. */
  submittedLineIndexes: number[];
};

/** A name, quantity, or unit cost is enough. Notes and uses are not. */
export function gameChangeNeedsConfirm(
  lines: ReadonlyArray<
    Pick<EnhancementLineDraft, "name" | "quantity" | "userCostInput">
  >,
): boolean {
  return lines.some(
    (line) =>
      line.name.trim() !== "" ||
      line.quantity.trim() !== "" ||
      line.userCostInput.trim() !== "",
  );
}

/** Names tablets or scarabs for the game being left. */
export function gameChangePrompt(game: Game): string {
  const rows = strategyLabels(game).enhancement.toLowerCase();
  return `Switch games and clear the ${rows}?`;
}

function isBlankLine(line: EnhancementLineDraft, game: Game): boolean {
  const contentBlank =
    line.name.trim() === "" &&
    line.quantity.trim() === "" &&
    line.userCostInput.trim() === "" &&
    line.modifierNotes.trim() === "";
  if (!contentBlank) {
    return false;
  }
  if (game === "POE1") {
    return true;
  }
  const uses = line.uses.trim();
  return uses === "" || uses === DEFAULT_TABLET_USES;
}

/** A count, not money. Blank becomes 0 so the contract can reject it. */
function usesFromDraft(raw: string): number {
  return Number(raw.trim());
}

/**
 * Build a create/update body. A row with only the default Uses is omitted.
 * Modifier notes are sent only for PoE2. A PoE1 line is saved at 1 use.
 * `submittedLineIndexes` maps a Zod path `enhancementLines.N` back to the form row.
 */
export function buildStrategyWriteBody(
  draft: StrategyFormDraft,
): StrategyWriteDraftResult {
  const submittedLineIndexes: number[] = [];
  const enhancementLines: StrategyWriteBody["enhancementLines"] = [];

  draft.enhancementLines.forEach((line, formIndex) => {
    if (isBlankLine(line, draft.game)) {
      return;
    }
    const notes = line.modifierNotes.trim();
    const submitted: StrategyWriteBody["enhancementLines"][number] = {
      name: line.name.trim(),
      quantity: line.quantity.trim(),
      userCostInput: line.userCostInput.trim(),
      currency: line.currency,
      uses: draft.game === "POE1" ? 1 : usesFromDraft(line.uses),
      sortOrder: enhancementLines.length,
    };
    if (draft.game === "POE2" && notes !== "") {
      submitted.modifierNotes = notes;
    }
    enhancementLines.push(submitted);
    submittedLineIndexes.push(formIndex);
  });

  const mapNotes = draft.mapNotes.trim();
  const body: StrategyWriteBody = {
    name: draft.name.trim(),
    game: draft.game,
    description: draft.description.trim(),
    mapUnitCostChaos: draft.mapUnitCostChaos.trim(),
    divineRateChaos: draft.divineRateChaos.trim() || null,
    enhancementLines,
  };
  if (mapNotes !== "") {
    body.mapNotes = mapNotes;
  }
  return { body, submittedLineIndexes };
}

/** Same path join as the API's Zod details, without importing server code. */
export function detailsFromZod(error: ZodError): ApiErrorDetail[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

/** Remap `enhancementLines.N` onto the form row that was actually submitted. */
export function formDetailPath(
  path: string,
  submittedLineIndexes: number[],
): string {
  const match = /^enhancementLines\.(\d+)(\..*)?$/.exec(path);
  if (!match) {
    return path;
  }
  const formIndex = submittedLineIndexes[Number(match[1])];
  if (formIndex === undefined) {
    return path;
  }
  const rest = match[2] ?? "";
  return `enhancementLines.${formIndex}${rest}`;
}
