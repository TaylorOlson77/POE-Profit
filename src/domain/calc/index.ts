import Decimal from "decimal.js";

/**
 * Pure calculation engine — no Prisma/Next imports (ADR-016).
 * Chaos is canonical; Divine is secondary (ADR-003).
 * Full money/efficiency math lands in Epic C; this is the A4 stub.
 */

export { Decimal };

/** Smoke export proving the calc module loads with decimal.js. */
export function isCalcModuleReady(): boolean {
  return true;
}

/**
 * Placeholder line-total helper — quantity × unitValue in Chaos.
 * Epic C will expand this into the full engine.
 */
export function lineTotal(quantity: Decimal.Value, unitValue: Decimal.Value): Decimal {
  return new Decimal(quantity).times(unitValue);
}
