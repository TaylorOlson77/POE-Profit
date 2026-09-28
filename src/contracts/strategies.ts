import { z } from "zod";
import { DecimalStringSchema, POSTGRES_INT_MAX } from "./decimal";

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
 * A map session of N maps scales these costs by N when prefilling/estimating investment.
 */

/** Soft UI target ~5 enhancement lines; hard API cap against abuse (no auth). */
export const MAX_STRATEGY_ENHANCEMENT_LINES = 25;

/** PoE2-first UI; domain allows PoE1 later (ADR-002). */
export const GameSchema = z.enum(["POE2", "POE1"]);

export type Game = z.infer<typeof GameSchema>;

/**
 * Scarab (PoE1) / tablet (PoE2) line — repeating list only.
 * UI labels and modifierNotes visibility come from Strategy.game.
 */
export const StrategyEnhancementLineInputSchema = z.object({
  name: z.string().min(1),
  /** Free-text mods for now; UI shows only for PoE2 tablets. */
  modifierNotes: z.string().optional(),
  /** Per-map quantity. */
  quantity: DecimalStringSchema,
  unitCostChaos: DecimalStringSchema,
  sortOrder: z.number().int().nonnegative().max(POSTGRES_INT_MAX).optional(),
});

export type StrategyEnhancementLineInput = z.infer<
  typeof StrategyEnhancementLineInputSchema
>;

/** Persisted enhancement line in API responses. */
export const StrategyEnhancementLineSchema =
  StrategyEnhancementLineInputSchema.extend({
    id: z.string().min(1),
    /** quantity × unitCostChaos (Chaos); compute-on-write via calc engine. */
    lineTotalChaos: DecimalStringSchema,
  });

export type StrategyEnhancementLine = z.infer<
  typeof StrategyEnhancementLineSchema
>;

/** Persisted Strategy resource (response shape). */
export const StrategySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  game: GameSchema,
  description: z.string().min(1),
  /** Map/waystone notes; later may become structured/regex. */
  mapNotes: z.string().optional(),
  /**
   * Cost of one map/waystone in Chaos (quantity implied = 1).
   * UI label: Map (PoE1) / Waystone (PoE2).
   */
  mapUnitCostChaos: DecimalStringSchema,
  enhancementLines: z
    .array(StrategyEnhancementLineSchema)
    .max(MAX_STRATEGY_ENHANCEMENT_LINES),
  /**
   * mapUnitCostChaos + sum(enhancement lineTotals).
   * Each lineTotalChaos = quantity × unitCostChaos (e.g. 2×100 + 1×10 = 210).
   * Calculated — not user-edited (ADR-008 / ADR-018 / ADR-020).
   */
  estimatedCostPerMapChaos: DecimalStringSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Strategy = z.infer<typeof StrategySchema>;

/** POST /api/strategies body */
export const CreateStrategyBodySchema = z.object({
  name: z.string().min(1),
  game: GameSchema,
  description: z.string().min(1),
  mapNotes: z.string().optional(),
  mapUnitCostChaos: DecimalStringSchema,
  enhancementLines: z
    .array(StrategyEnhancementLineInputSchema)
    .max(MAX_STRATEGY_ENHANCEMENT_LINES)
    .default([]),
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
