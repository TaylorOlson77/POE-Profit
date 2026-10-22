import { z } from "zod";
import { DecimalStringSchema, NullableDecimalStringSchema, POSTGRES_INT_MAX } from "./decimal";
import { DescriptionSchema, NameSchema, OptionalNotesSchema } from "./text";

/**
 * Strategy API contracts (contract-first — ADR-013 / ADR-020 / backlog B1).
 *
 * These schemas are the handshake between Route Handlers, UI, and API tests.
 *
 * Status codes (MVP):
 * | Method | Path                      | Success      | Common errors        |
 * | ------ | ------------------------- | ------------ | -------------------- |
 * | GET    | /api/strategies           | 200          | 500                  |
 * | POST   | /api/strategies           | 201          | 400 validation, 500  |
 * | GET    | /api/strategies/:id       | 200          | 404, 500             |
 * | PUT    | /api/strategies/:id       | 200          | 400, 404, 500        |
 * | DELETE | /api/strategies/:id       | 204 no body  | 404, 409, 500        |
 *
 * 409 CONFLICT: the strategy still has map sessions (`onDelete: Restrict`).
 * The UI should show `error.message`. 404 is an unknown id.
 *
 * Error bodies use `ApiErrorBody` from `./errors`.
 *
 * Map/waystone is a required 1:1 slot on Strategy (qty always 1 per map).
 * Enhancement lines are scarabs (PoE1) or tablets (PoE2); quantities are per map.
 * A line is typed in chaos or divines. The service stores the chaos unit cost.
 * A divine line requires divineRateChaos. A chaos-only strategy may leave it null.
 * A map session of N maps scales these costs by N when prefilling/estimating investment.
 */

/** Soft UI target ~5 enhancement lines; hard API cap against abuse (no auth). */
export const MAX_STRATEGY_ENHANCEMENT_LINES = 25;

const USES_COUNT_MESSAGE = "Uses must be a whole number of at least 1";

export const DIVINE_RATE_REQUIRED_MESSAGE = "A divine rate is required";

export const CurrencySchema = z.enum(["CHAOS", "DIVINE"]);

export type Currency = z.infer<typeof CurrencySchema>;

/** "0" and "0.00" are not a usable divine rate. Other decimals already passed the wire schema. */
function isPositiveDecimal(value: string): boolean {
  return !/^0+(?:\.0+)?$/.test(value);
}

/** PoE2-first UI; domain allows PoE1 later (ADR-002). */
export const GameSchema = z.enum(["POE2", "POE1"]);

export type Game = z.infer<typeof GameSchema>;

/**
 * Scarab (PoE1) / tablet (PoE2) line — repeating list only.
 * UI labels and modifierNotes visibility come from Strategy.game.
 */
export const StrategyEnhancementLineInputSchema = z.object({
  name: NameSchema,
  /** Free-text mods for now; UI shows only for PoE2 tablets. */
  modifierNotes: OptionalNotesSchema,
  /** Per-map quantity. */
  quantity: DecimalStringSchema,
  /** Typed amount, in `currency`. */
  userCostInput: DecimalStringSchema,
  /** Maps one purchase lasts. Whole number of at least 1, within int4. */
  uses: z
    .number({ error: USES_COUNT_MESSAGE })
    .int({ error: USES_COUNT_MESSAGE })
    .min(1, { error: USES_COUNT_MESSAGE })
    .max(POSTGRES_INT_MAX, { error: USES_COUNT_MESSAGE }),
  sortOrder: z.number().int().nonnegative().max(POSTGRES_INT_MAX).optional(),
  currency: CurrencySchema.default("CHAOS"),
});

export type StrategyEnhancementLineInput = z.infer<
  typeof StrategyEnhancementLineInputSchema
>;

/** Persisted enhancement line in API responses. */
export const StrategyEnhancementLineSchema =
  StrategyEnhancementLineInputSchema.extend({
    id: z.string().min(1),
    /** (quantity × unitCostChaos) / uses (Chaos); compute-on-write via calc engine. */
    lineTotalChaos: DecimalStringSchema,
    /** Chaos unit cost after a divine line is converted. A chaos line copies userCostInput. */
    unitCostChaos: DecimalStringSchema,
  });

export type StrategyEnhancementLine = z.infer<
  typeof StrategyEnhancementLineSchema
>;

/** Persisted Strategy resource (response shape). */
export const StrategySchema = z.object({
  id: z.string().min(1),
  name: NameSchema,
  game: GameSchema,
  description: DescriptionSchema,
  /** Map/waystone notes; later may become structured/regex. */
  mapNotes: OptionalNotesSchema,
  /**
   * Cost of one map/waystone in Chaos (quantity implied = 1).
   * UI label: Map (PoE1) / Waystone (PoE2).
   */
  mapUnitCostChaos: DecimalStringSchema,
  divineRateChaos: NullableDecimalStringSchema,
  enhancementLines: z
    .array(StrategyEnhancementLineSchema)
    .max(MAX_STRATEGY_ENHANCEMENT_LINES),
  /**
   * mapUnitCostChaos + sum(enhancement lineTotals).
   * Each lineTotalChaos = (quantity × unitCostChaos) / uses.
   * Uses of 1 leaves quantity × unit cost (e.g. 2×100/1 + 1×10/1 = 210).
   * Calculated — not user-edited (ADR-008 / ADR-018 / ADR-020).
   */
  estimatedCostPerMapChaos: DecimalStringSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Strategy = z.infer<typeof StrategySchema>;

/** POST /api/strategies body */
export const CreateStrategyBodySchema = z
  .object({
    name: NameSchema,
    game: GameSchema,
    description: DescriptionSchema,
    mapNotes: OptionalNotesSchema,
    mapUnitCostChaos: DecimalStringSchema,
    divineRateChaos: NullableDecimalStringSchema,
    enhancementLines: z
      .array(StrategyEnhancementLineInputSchema)
      .max(MAX_STRATEGY_ENHANCEMENT_LINES)
      .default([]),
  })
  .superRefine((body, ctx) => {
    const needsRate = body.enhancementLines.some(
      (line) => line.currency === "DIVINE",
    );
    if (!needsRate) {
      return;
    }
    if (
      body.divineRateChaos !== null &&
      isPositiveDecimal(body.divineRateChaos)
    ) {
      return;
    }
    ctx.addIssue({
      code: "custom",
      path: ["divineRateChaos"],
      message: DIVINE_RATE_REQUIRED_MESSAGE,
    });
  });

export type CreateStrategyBody = z.infer<typeof CreateStrategyBodySchema>;

/**
 * PUT /api/strategies/:id body — full replace of writable fields
 * (same shape as create for MVP).
 */
export const UpdateStrategyBodySchema = CreateStrategyBodySchema;

export type UpdateStrategyBody = z.infer<typeof UpdateStrategyBodySchema>;

/** GET /api/strategies */
export const StrategyListResponseSchema = z.object({
  strategies: z.array(StrategySchema),
});

export type StrategyListResponse = z.infer<typeof StrategyListResponseSchema>;

/** POST 201 / GET 200 / PUT 200 — single strategy */
export const StrategyResponseSchema = StrategySchema;

export type StrategyResponse = z.infer<typeof StrategyResponseSchema>;

/** Path param for /api/strategies/:id */
export const StrategyIdParamSchema = z.object({
  id: z.string().min(1),
});

export type StrategyIdParam = z.infer<typeof StrategyIdParamSchema>;
