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

/**
 * Postgres int4 upper bound. `mapsCompleted`, `sampleMapsCompleted`, and
 * enhancement `sortOrder` are already non-negative, so this is the new cap.
 */
export const POSTGRES_INT_MAX = 2_147_483_647;

/**
 * NUMERIC(20, 8) (ADR-021): at most 12 digits before the point and 8 after.
 * The unbounded shape is checked first so a minus or a letter keeps that
 * message. The column shape rejects a value Postgres would round or overflow.
 */
const DECIMAL_BODY = "(?:0|[1-9]\\d*)(?:\\.\\d+)?";
const MONEY_COLUMN_BODY = "(?:0|[1-9]\\d{0,11})(?:\\.\\d{1,8})?";
const MONEY_COLUMN_MESSAGE =
  "Must have at most 12 integer digits and 8 fractional digits";

/** Non-negative: "0", "10", "0.20" */
export const DecimalStringSchema = z
  .string()
  .regex(new RegExp(`^${DECIMAL_BODY}$`), "Must be a non-negative decimal string")
  .regex(new RegExp(`^${MONEY_COLUMN_BODY}$`), MONEY_COLUMN_MESSAGE);

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
    new RegExp(`^-?${DECIMAL_BODY}$`),
    "Must be a decimal string (optional leading minus)",
  )
  .regex(new RegExp(`^-?${MONEY_COLUMN_BODY}$`), MONEY_COLUMN_MESSAGE);

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

/** Same as SignedDecimalString, or null when a calculated metric is N/A. */
export const NullableSignedDecimalStringSchema =
  SignedDecimalStringSchema.nullable();

export type NullableSignedDecimalString = z.infer<
  typeof NullableSignedDecimalStringSchema
>;
