import Decimal from "decimal.js";

/**
 * Pure calculation engine — no Prisma/Next imports (ADR-016).
 * Chaos is canonical; Divine is secondary (ADR-003).
 *
 * C1 owns line totals, strategy per-map cost, session investment/revenue, and
 * profit. C2 owns duration methods, rate metrics, and ROI (null when N/A —
 * never Infinity/NaN). Divine conversion and display rounding are C3 — this
 * module does not round and does not call Decimal.set() (that config is
 * process-global).
 *
 * Conversion boundary (D1/D2 services, not here):
 * API JSON uses decimal strings (DecimalStringSchema); Prisma returns Decimal
 * objects; this engine accepts Decimal.Value and returns decimal.js Decimal.
 * Never Number() a money value.
 */

export type MoneyLineInput = {
  quantity: Decimal.Value;
  unitValueChaos: Decimal.Value;
};

export type StrategyEnhancementCostInput = {
  quantity: Decimal.Value;
  unitCostChaos: Decimal.Value;
};

export type StrategyCostsInput = {
  mapUnitCostChaos: Decimal.Value;
  enhancementLines: ReadonlyArray<StrategyEnhancementCostInput>;
};

export type StrategyCostsResult = {
  enhancementLineTotals: Decimal[];
  estimatedCostPerMapChaos: Decimal;
};

export type SessionMoneyInput = {
  mapsCompleted: number;
  mapUnitCostChaos: Decimal.Value;
  investmentLines: ReadonlyArray<MoneyLineInput>;
  revenueLines: ReadonlyArray<MoneyLineInput>;
};

export type SessionMoneyResult = {
  mapInvestmentChaos: Decimal;
  investmentLineTotals: Decimal[];
  revenueLineTotals: Decimal[];
  totalInvestmentChaos: Decimal;
  totalRevenueChaos: Decimal;
  profitChaos: Decimal;
};

/** Mirrors contract DurationMethodLabelSchema without importing Zod. */
export type DurationMethodLabel = "Extrapolated" | "Observed" | "Manual";

export type ExtrapolatedDurationInput = {
  durationMethod: "EXTRAPOLATED";
  sampleMapsCompleted: number;
  sampleDurationMinutes: Decimal.Value;
};

export type ObservedDurationInput = {
  durationMethod: "OBSERVED";
  startedAt: Date | string;
  endedAt: Date | string;
};

export type ManualDurationInput = {
  durationMethod: "MANUAL";
  manualDurationMinutes: Decimal.Value;
};

export type SessionDurationInput =
  | ExtrapolatedDurationInput
  | ObservedDurationInput
  | ManualDurationInput;

export type EffectiveDurationResult = {
  minutes: Decimal;
  durationMethodLabel: DurationMethodLabel;
};

export type SessionCalcInput = SessionMoneyInput & {
  duration: SessionDurationInput;
};

export type SessionCalcResult = SessionMoneyResult & {
  effectiveDurationMinutes: Decimal;
  durationMethodLabel: DurationMethodLabel;
  profitPerHourChaos: Decimal | null;
  profitPerMapChaos: Decimal | null;
  mapsPerHour: Decimal | null;
  roiPercent: Decimal | null;
};

/** lineTotal = quantity × unitValue (Chaos). */
export function lineTotal(
  quantity: Decimal.Value,
  unitValue: Decimal.Value,
): Decimal {
  return new Decimal(quantity).times(unitValue);
}

/** Sum of already-computed line totals. Empty list is 0. */
export function sumLineTotals(totals: ReadonlyArray<Decimal.Value>): Decimal {
  return totals.reduce<Decimal>(
    (acc, value) => acc.plus(value),
    new Decimal(0),
  );
}

/** profit = totalRevenue - totalInvestment (Chaos). May be negative. */
export function profit(
  totalRevenue: Decimal.Value,
  totalInvestment: Decimal.Value,
): Decimal {
  return new Decimal(totalRevenue).minus(totalInvestment);
}

/**
 * Per-map strategy cost (ADR-020).
 * Each enhancement lineTotal = quantity × unitCostChaos (not unit cost alone).
 * estimatedCostPerMap = mapUnitCostChaos + sum(enhancement line totals).
 */
export function calculateStrategyCosts(
  input: StrategyCostsInput,
): StrategyCostsResult {
  const enhancementLineTotals = input.enhancementLines.map((line) =>
    lineTotal(line.quantity, line.unitCostChaos),
  );

  return {
    enhancementLineTotals,
    estimatedCostPerMapChaos: new Decimal(input.mapUnitCostChaos).plus(
      sumLineTotals(enhancementLineTotals),
    ),
  };
}

/**
 * Session money (C1). Map spend is mapsCompleted × mapUnitCostChaos and is
 * never read from investment lines — putting the waystone on a line as well
 * would double-count (guard that at D2/E2; this function always adds map spend
 * from those two fields).
 */
export function calculateSessionMoney(
  input: SessionMoneyInput,
): SessionMoneyResult {
  const mapInvestmentChaos = lineTotal(
    input.mapsCompleted,
    input.mapUnitCostChaos,
  );
  const investmentLineTotals = input.investmentLines.map((line) =>
    lineTotal(line.quantity, line.unitValueChaos),
  );
  const revenueLineTotals = input.revenueLines.map((line) =>
    lineTotal(line.quantity, line.unitValueChaos),
  );
  const totalInvestmentChaos = mapInvestmentChaos.plus(
    sumLineTotals(investmentLineTotals),
  );
  const totalRevenueChaos = sumLineTotals(revenueLineTotals);

  return {
    mapInvestmentChaos,
    investmentLineTotals,
    revenueLineTotals,
    totalInvestmentChaos,
    totalRevenueChaos,
    profitChaos: profit(totalRevenueChaos, totalInvestmentChaos),
  };
}

/**
 * Effective duration from the session's duration method (ADR-006).
 * Throws on invalid extrapolated samples or observed end-before-start so the
 * engine never divides by zero. Zod still owns the user-facing 400 (D2).
 */
export function effectiveDurationMinutes(
  duration: SessionDurationInput,
  mapsCompleted: number,
): EffectiveDurationResult {
  switch (duration.durationMethod) {
    case "EXTRAPOLATED": {
      if (duration.sampleMapsCompleted <= 0) {
        throw new Error("sampleMapsCompleted must be greater than zero");
      }
      const sampleDuration = new Decimal(duration.sampleDurationMinutes);
      if (sampleDuration.lte(0)) {
        throw new Error("sampleDurationMinutes must be greater than zero");
      }
      return {
        minutes: sampleDuration
          .div(duration.sampleMapsCompleted)
          .times(mapsCompleted),
        durationMethodLabel: "Extrapolated",
      };
    }
    case "OBSERVED": {
      const startedMs = new Date(duration.startedAt).getTime();
      const endedMs = new Date(duration.endedAt).getTime();
      if (endedMs < startedMs) {
        throw new Error("endedAt must not precede startedAt");
      }
      return {
        minutes: new Decimal(endedMs - startedMs).div(60000),
        durationMethodLabel: "Observed",
      };
    }
    case "MANUAL":
      return {
        minutes: new Decimal(duration.manualDurationMinutes),
        durationMethodLabel: "Manual",
      };
  }
}

/** profit / (durationMinutes / 60). Null when duration is zero. */
export function profitPerHourChaos(
  profitChaos: Decimal.Value,
  durationMinutes: Decimal.Value,
): Decimal | null {
  const minutes = new Decimal(durationMinutes);
  if (minutes.isZero()) {
    return null;
  }
  // profit / (minutes / 60) = profit × 60 / minutes. Multiply first so
  // integer-minute sessions (e.g. 80 min → 1440c/hr) stay exact.
  return new Decimal(profitChaos).times(60).div(minutes);
}

/** profit / mapsCompleted. Null when mapsCompleted is 0. */
export function profitPerMapChaos(
  profitChaos: Decimal.Value,
  mapsCompleted: number,
): Decimal | null {
  if (mapsCompleted === 0) {
    return null;
  }
  return new Decimal(profitChaos).div(mapsCompleted);
}

/**
 * mapsCompleted / (durationMinutes / 60).
 * Null when duration is zero or mapsCompleted is 0 (spec: not 0 maps/hour).
 */
export function mapsPerHour(
  mapsCompleted: number,
  durationMinutes: Decimal.Value,
): Decimal | null {
  if (mapsCompleted === 0) {
    return null;
  }
  const minutes = new Decimal(durationMinutes);
  if (minutes.isZero()) {
    return null;
  }
  return new Decimal(mapsCompleted).times(60).div(minutes);
}

/** profit / totalInvestment × 100. Null when investment is zero (not 0%). */
export function roiPercent(
  profitChaos: Decimal.Value,
  totalInvestmentChaos: Decimal.Value,
): Decimal | null {
  const investment = new Decimal(totalInvestmentChaos);
  if (investment.isZero()) {
    return null;
  }
  return new Decimal(profitChaos).div(investment).times(100);
}

/** C1 money + C2 duration and rates. Divine approx is C3. */
export function calculateSession(input: SessionCalcInput): SessionCalcResult {
  const money = calculateSessionMoney(input);
  const duration = effectiveDurationMinutes(
    input.duration,
    input.mapsCompleted,
  );

  return {
    ...money,
    effectiveDurationMinutes: duration.minutes,
    durationMethodLabel: duration.durationMethodLabel,
    profitPerHourChaos: profitPerHourChaos(
      money.profitChaos,
      duration.minutes,
    ),
    profitPerMapChaos: profitPerMapChaos(
      money.profitChaos,
      input.mapsCompleted,
    ),
    mapsPerHour: mapsPerHour(input.mapsCompleted, duration.minutes),
    roiPercent: roiPercent(money.profitChaos, money.totalInvestmentChaos),
  };
}
