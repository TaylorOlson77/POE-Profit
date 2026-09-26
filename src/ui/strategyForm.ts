import type { ApiErrorDetail } from "@/src/contracts/errors";
import type { Game } from "@/src/contracts/strategies";
import type { ZodError } from "zod";

export type EnhancementLineDraft = {
  name: string;
  quantity: string;
  unitCostChaos: string;
  modifierNotes: string;
};

export type StrategyFormDraft = {
  name: string;
  game: Game;
  description: string;
  mapNotes: string;
  mapUnitCostChaos: string;
  enhancementLines: EnhancementLineDraft[];
};

export type StrategyWriteBody = {
  name: string;
  game: Game;
  description: string;
  mapNotes?: string;
  mapUnitCostChaos: string;
  enhancementLines: Array<{
    name: string;
    quantity: string;
    unitCostChaos: string;
    sortOrder: number;
    modifierNotes?: string;
  }>;
};

export type StrategyWriteDraftResult = {
  body: StrategyWriteBody;
  /** Form indexes of lines included in `body.enhancementLines`, in submit order. */
  submittedLineIndexes: number[];
};

function isBlankLine(line: EnhancementLineDraft): boolean {
  return (
    line.name.trim() === "" &&
    line.quantity.trim() === "" &&
    line.unitCostChaos.trim() === "" &&
    line.modifierNotes.trim() === ""
  );
}

/**
 * Build a create/update body. Blank lines are omitted. Modifier notes are
 * sent only for PoE2. `submittedLineIndexes` maps a Zod path
 * `enhancementLines.N` back to the form row.
 */
export function buildStrategyWriteBody(
  draft: StrategyFormDraft,
): StrategyWriteDraftResult {
  const submittedLineIndexes: number[] = [];
  const enhancementLines: StrategyWriteBody["enhancementLines"] = [];

  draft.enhancementLines.forEach((line, formIndex) => {
    if (isBlankLine(line)) {
      return;
    }
    const notes = line.modifierNotes.trim();
    const submitted: StrategyWriteBody["enhancementLines"][number] = {
      name: line.name.trim(),
      quantity: line.quantity.trim(),
      unitCostChaos: line.unitCostChaos.trim(),
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
