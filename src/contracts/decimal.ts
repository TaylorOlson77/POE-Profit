import { z } from "zod";

/**
 * Money / quantity wire format (ADR-015): decimal **strings**, not JSON numbers.
 *
 * Named schemas (not one mega-schema) is normal Zod practice:
 * - compose with `.nullable()` / `.refine()` where needed
 * - keep call sites readable (`PositiveDecimalStringSchema` vs options objects)
 *
 * A factory like `decimalString({ min: "exclusive", nullish: true })` is
 * fine later if variants multiply; for a handful of cases, named exports are
 * clearer.
 */

/** Non-negative: "0", "10", "0.20" */
export const DecimalStringSchema = z
  .string()
  .regex(
    /^(?:0|[1-9]\d*)(?:\.\d+)?$/,
    "Must be a non-negative decimal string",
  );

export type DecimalString = z.infer<typeof DecimalStringSchema>;

/**
 * Optional leading minus: "50", "0", "-50".
 * "Signed" like a signed integer — positive, zero, and negative are all valid.
 * Use for calculated fields that can lose money (profit). Quantities and unit
 * costs stay on DecimalStringSchema.
 */
export const SignedDecimalStringSchema = z
  .string()
  .regex(
    /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/,
    "Must be a decimal string (optional leading minus)",
  );

export type SignedDecimalString = z.infer<typeof SignedDecimalStringSchema>;

/** Greater than zero (sample duration, etc.). */
export const PositiveDecimalStringSchema = DecimalStringSchema.refine(
  (value) => value !== "0" && !/^0+\.?0*$/.test(value),
  { message: "Must be greater than zero" },
);

export type PositiveDecimalString = z.infer<typeof PositiveDecimalStringSchema>;

/** Same as DecimalString, or null when a calculated metric is N/A. */
export const NullableDecimalStringSchema = DecimalStringSchema.nullable();

export type NullableDecimalString = z.infer<typeof NullableDecimalStringSchema>;
