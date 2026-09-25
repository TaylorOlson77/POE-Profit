import Decimal from "decimal.js";

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
