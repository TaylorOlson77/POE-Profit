import Decimal from "decimal.js";

/**
 * Pure calculation engine — no Prisma/Next imports (ADR-016).
 * Chaos is canonical; Divine is secondary (ADR-003).
 *
 * C1 owns line totals, strategy per-map cost, session investment/revenue, and
 * profit. Duration / rate metrics / ROI are C2. Divine conversion and display
 * rounding are C3 — this module does not round and does not call Decimal.set()
 * (that config is process-global).
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
