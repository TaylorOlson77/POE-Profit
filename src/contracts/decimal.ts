import { z } from "zod";

/**
 * Money / quantity wire format (ADR-015): decimal **strings**, not JSON numbers.
 *
 * Three small schemas (not one mega-schema) is normal Zod practice:
 * - compose with `.nullable()` / `.refine()` where needed
 * - keep call sites readable (`PositiveDecimalStringSchema` vs options objects)
 *
 * A factory like `decimalString({ min: "exclusive", nullish: true })` is
 * fine later if variants multiply; for three cases, named exports are clearer.
 */

/** Non-negative: "0", "10", "0.20" */
export const DecimalStringSchema = z
  .string()
  .regex(
    /^(?:0|[1-9]\d*)(?:\.\d+)?$/,
    "Must be a non-negative decimal string",
  );

export type DecimalString = z.infer<typeof DecimalStringSchema>;

/** Greater than zero (sample duration, etc.). */
export const PositiveDecimalStringSchema = DecimalStringSchema.refine(
  (value) => value !== "0" && !/^0+\.?0*$/.test(value),
  { message: "Must be greater than zero" },
);

export type PositiveDecimalString = z.infer<typeof PositiveDecimalStringSchema>;

/** Same as DecimalString, or null when a calculated metric is N/A. */
export const NullableDecimalStringSchema = DecimalStringSchema.nullable();

export type NullableDecimalString = z.infer<typeof NullableDecimalStringSchema>;
