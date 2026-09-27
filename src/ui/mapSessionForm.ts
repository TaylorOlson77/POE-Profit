import type { ApiErrorDetail } from "@/src/contracts/errors";
import type {
  CreateMapSessionBody,
  DurationMethod,
  MapSessionInvestmentLineInput,
  MapSessionRevenueLineInput,
} from "@/src/contracts/mapSessions";

export type InvestmentLineDraft = {
  name: string;
  quantity: string;
  unitValueChaos: string;
  /** ISO timestamp from the last save. Null on a new line. */
  priceRecordedAt: string | null;
  /** Unit value as last saved. Null on a new line. */
  savedUnitValueChaos: string | null;
};

export type RevenueLineDraft = InvestmentLineDraft & {
  category: string;
};

export type MapSessionFormDraft = {
  strategyId: string;
  mapsCompleted: string;
  mapUnitCostChaos: string;
  divineRateChaos: string;
  notes: string;
  durationMethod: DurationMethod;
  sampleMapsCompleted: string;
  sampleDurationMinutes: string;
  startedAtLocal: string;
  endedAtLocal: string;
  manualDurationMinutes: string;
  investmentLines: InvestmentLineDraft[];
  revenueLines: RevenueLineDraft[];
};

export type MapSessionWriteDraftResult = {
  body: CreateMapSessionBody;
  submittedInvestmentIndexes: number[];
  submittedRevenueIndexes: number[];
  /** Whole-number problems caught before Zod, so the form can say so plainly. */
  fieldErrors: ApiErrorDetail[];
};

const WHOLE_NUMBER = /^(?:0|[1-9]\d*)$/;
const POSITIVE_WHOLE_NUMBER = /^[1-9]\d*$/;

function parseWholeNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!WHOLE_NUMBER.test(trimmed)) {
    return undefined;
  }
  return Number(trimmed);
}

function isBlankMoneyLine(line: InvestmentLineDraft): boolean {
  return (
    line.name.trim() === "" &&
    line.quantity.trim() === "" &&
    line.unitValueChaos.trim() === ""
  );
}

/**
 * New lines and unit-value edits get a fresh snapshot. Quantity-only edits
 * keep the stored timestamp (MVP_SPEC §12).
 */
function priceRecordedAtFor(line: InvestmentLineDraft, now: Date): string {
  const unit = line.unitValueChaos.trim();
  if (
    line.priceRecordedAt !== null &&
    line.savedUnitValueChaos !== null &&
    unit === line.savedUnitValueChaos.trim()
  ) {
    return line.priceRecordedAt;
  }
  return now.toISOString();
}

function investmentLine(
  line: InvestmentLineDraft,
  now: Date,
): MapSessionInvestmentLineInput {
  return {
    name: line.name.trim(),
    quantity: line.quantity.trim(),
    unitValueChaos: line.unitValueChaos.trim(),
    priceRecordedAt: priceRecordedAtFor(line, now),
    priceSource: "MANUAL",
    valuationType: "ACTUAL_PAID",
  };
}

/** `datetime-local` is local time. Empty or unparseable input returns null. */
export function localDateTimeToIso(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

/** Minute precision for `<input type="datetime-local">`. */
export function isoToLocalDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function remapLinePath(
  path: string,
  prefix: "investmentLines" | "revenueLines",
  submittedIndexes: number[],
): string | null {
  const match = new RegExp(`^${prefix}\\.(\\d+)(\\..*)?$`).exec(path);
  if (!match) {
    return null;
  }
  const formIndex = submittedIndexes[Number(match[1])];
  if (formIndex === undefined) {
    return path;
  }
  const rest = match[2] ?? "";
  return `${prefix}.${formIndex}${rest}`;
}

/** Remap `investmentLines.N` / `revenueLines.N` onto the form row that was submitted. */
export function formDetailPath(
  path: string,
  submittedInvestmentIndexes: number[],
  submittedRevenueIndexes: number[],
): string {
  return (
    remapLinePath(path, "investmentLines", submittedInvestmentIndexes) ??
    remapLinePath(path, "revenueLines", submittedRevenueIndexes) ??
    path
  );
}

/** Fields the unsaved banner compares. Omits price timestamps and saved totals. */
export function sessionDraftSignature(draft: MapSessionFormDraft): string {
  return JSON.stringify({
    strategyId: draft.strategyId.trim(),
    mapsCompleted: draft.mapsCompleted.trim(),
    mapUnitCostChaos: draft.mapUnitCostChaos.trim(),
    divineRateChaos: draft.divineRateChaos.trim(),
    notes: draft.notes.trim(),
    durationMethod: draft.durationMethod,
    sampleMapsCompleted: draft.sampleMapsCompleted.trim(),
    sampleDurationMinutes: draft.sampleDurationMinutes.trim(),
    startedAtLocal: draft.startedAtLocal.trim(),
    endedAtLocal: draft.endedAtLocal.trim(),
    manualDurationMinutes: draft.manualDurationMinutes.trim(),
    investmentLines: draft.investmentLines.map((line) => ({
      name: line.name.trim(),
      quantity: line.quantity.trim(),
      unitValueChaos: line.unitValueChaos.trim(),
    })),
    revenueLines: draft.revenueLines.map((line) => ({
      category: line.category.trim(),
      name: line.name.trim(),
      quantity: line.quantity.trim(),
      unitValueChaos: line.unitValueChaos.trim(),
    })),
  });
}

/**
 * Build a create/update body. Blank money lines are omitted. Only the active
 * duration method's fields are included. `submitted*Indexes` map a Zod path
 * back to the form row.
 *
 * Count fields that are not whole numbers are `undefined` on the body and
 * listed in `fieldErrors`. Callers should prefer those messages over Zod's.
 */
export function buildMapSessionWriteBody(
  draft: MapSessionFormDraft,
  now: Date = new Date(),
): MapSessionWriteDraftResult {
  const fieldErrors: ApiErrorDetail[] = [];
  if (draft.strategyId.trim() === "") {
    fieldErrors.push({
      path: "strategyId",
      message: "Select a strategy",
    });
  }
  const mapsCompleted = parseWholeNumber(draft.mapsCompleted);
  if (mapsCompleted === undefined) {
    fieldErrors.push({
      path: "mapsCompleted",
      message: "Enter a whole number, zero or greater",
    });
  }

  const submittedInvestmentIndexes: number[] = [];
  const investmentLines: MapSessionInvestmentLineInput[] = [];
  draft.investmentLines.forEach((line, formIndex) => {
    if (isBlankMoneyLine(line)) {
      return;
    }
    investmentLines.push(investmentLine(line, now));
    submittedInvestmentIndexes.push(formIndex);
  });

  const submittedRevenueIndexes: number[] = [];
  const revenueLines: MapSessionRevenueLineInput[] = [];
  draft.revenueLines.forEach((line, formIndex) => {
    if (isBlankMoneyLine(line)) {
      return;
    }
    revenueLines.push({
      ...investmentLine(line, now),
      category: line.category.trim(),
    });
    submittedRevenueIndexes.push(formIndex);
  });

  const notes = draft.notes.trim();
  const shared = {
    strategyId: draft.strategyId.trim(),
    mapsCompleted: mapsCompleted as number,
    mapUnitCostChaos: draft.mapUnitCostChaos.trim(),
    divineRateChaos: draft.divineRateChaos.trim(),
    investmentLines,
    revenueLines,
    ...(notes === "" ? {} : { notes }),
  };

  if (draft.durationMethod === "EXTRAPOLATED") {
    const sampleMapsCompleted = parseWholeNumber(draft.sampleMapsCompleted);
    if (
      sampleMapsCompleted === undefined ||
      !POSITIVE_WHOLE_NUMBER.test(draft.sampleMapsCompleted.trim())
    ) {
      fieldErrors.push({
        path: "sampleMapsCompleted",
        message: "Enter a whole number greater than zero",
      });
    }
    return {
      body: {
        ...shared,
        durationMethod: "EXTRAPOLATED",
        sampleMapsCompleted: sampleMapsCompleted as number,
        sampleDurationMinutes: draft.sampleDurationMinutes.trim(),
      },
      submittedInvestmentIndexes,
      submittedRevenueIndexes,
      fieldErrors,
    };
  }

  if (draft.durationMethod === "OBSERVED") {
    return {
      body: {
        ...shared,
        durationMethod: "OBSERVED",
        startedAt: localDateTimeToIso(draft.startedAtLocal) ?? "",
        endedAt: localDateTimeToIso(draft.endedAtLocal) ?? "",
      },
      submittedInvestmentIndexes,
      submittedRevenueIndexes,
      fieldErrors,
    };
  }

  return {
    body: {
      ...shared,
      durationMethod: "MANUAL",
      manualDurationMinutes: draft.manualDurationMinutes.trim(),
    },
    submittedInvestmentIndexes,
    submittedRevenueIndexes,
    fieldErrors,
  };
}
