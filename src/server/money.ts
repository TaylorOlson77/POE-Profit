import Decimal from "decimal.js";

/** Largest absolute value NUMERIC(20, 8) can store. */
const MONEY_COLUMN_MAX = new Decimal("999999999999.99999999");

/**
 * True when Postgres can store this in NUMERIC(20, 8).
 * Scale past 8 places is rounded half away from zero, the same way the column
 * rounds. A value that rounds up to 10^12 does not fit. This is not display
 * rounding, and it does not change the engine result.
 */
export function fitsMoneyColumn(value: { toString(): string }): boolean {
  const rounded = new Decimal(value.toString()).toDecimalPlaces(
    8,
    Decimal.ROUND_HALF_UP,
  );
  return rounded.abs().lte(MONEY_COLUMN_MAX);
}

export const CALCULATED_TOTAL_OVERFLOW_MESSAGE =
  "Calculated total does not fit the money column";

/**
 * Prisma Decimal and decimal.js Decimal both become the contract wire string.
 *
 * `toString()` first so we never pass a number into decimal.js (that would be
 * a float). Trailing zeros from `Decimal(20, 8)` are stripped. This is not
 * display rounding — `roundForDisplay` stays in the UI.
 */
export function decimalToWire(value: { toString(): string }): string {
  const decimal = new Decimal(value.toString());
  // toString() emits "1e-8", which DecimalStringSchema rejects. toFixed keeps
  // plain decimal form; then drop the storage-scale zeros Prisma adds.
  const fixed = decimal.toFixed(decimal.decimalPlaces());
  if (!fixed.includes(".")) {
    return fixed;
  }
  const trimmed = fixed.replace(/0+$/, "").replace(/\.$/, "");
  return trimmed === "" || trimmed === "-" ? "0" : trimmed;
}

/** Null stays null. A present value uses the same plain-decimal wire form. */
export function nullableDecimalToWire(
  value: { toString(): string } | null,
): string | null {
  return value === null ? null : decimalToWire(value);
}
