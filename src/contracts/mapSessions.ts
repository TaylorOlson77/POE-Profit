import { z } from "zod";
import {
  DecimalStringSchema,
  NullableDecimalStringSchema,
  PositiveDecimalStringSchema,
} from "./decimal";

/**
 * MapSession API contracts (contract-first — ADR-005 / ADR-006 / backlog B2).
 *
 * A MapSession is one completed mapping session under a Strategy (formerly
 * called Run). UI copy may use Waystone / branded labels; domain stays MapSession.
 *
 * Status codes (MVP):
 * | Method | Path                        | Success      | Common errors        |
 * | ------ | --------------------------- | ------------ | -------------------- |
 * | GET    | /api/map-sessions           | 200          | 500                  |
 * | POST   | /api/map-sessions           | 201          | 400 validation, 500  |
 * | GET    | /api/map-sessions/:id       | 200          | 404, 500             |
 * | PUT    | /api/map-sessions/:id       | 200          | 400, 404, 500        |
 * | DELETE | /api/map-sessions/:id       | 204 no body  | 404, 500             |
 *
 * Error bodies use `ApiErrorBody` from `./errors`.
 *
 * Map/waystone cost is required (`mapUnitCostChaos`). Session map spend =
 * mapsCompleted × mapUnitCostChaos. Prefills from Strategy.mapUnitCostChaos.
 * Do not also put the map as an investment line — that would double-count.
 */

export const MAX_MAP_SESSION_INVESTMENT_LINES = 100;
export const MAX_MAP_SESSION_REVENUE_LINES = 100;

export const DurationMethodSchema = z.enum([
  "EXTRAPOLATED",
  "OBSERVED",
  "MANUAL",
]);

export type DurationMethod = z.infer<typeof DurationMethodSchema>;

/** UI-facing label for the duration method used for rate metrics. */
export const DurationMethodLabelSchema = z.enum([
  "Extrapolated",
  "Observed",
  "Manual",
]);

export type DurationMethodLabel = z.infer<typeof DurationMethodLabelSchema>;

/** MVP: manual snapshots only (ADR-004). */
export const PriceSourceSchema = z.literal("MANUAL");

export type PriceSource = z.infer<typeof PriceSourceSchema>;

/** MVP launch: actual paid only; extend when market/sale types are needed. */
export const ValuationTypeSchema = z.literal("ACTUAL_PAID");

export type ValuationType = z.infer<typeof ValuationTypeSchema>;

const MapSessionLineBaseInputSchema = z.object({
  name: z.string().min(1),
  quantity: DecimalStringSchema,
  unitValueChaos: DecimalStringSchema,
  priceRecordedAt: z.string().datetime(),
  priceSource: PriceSourceSchema.default("MANUAL"),
  valuationType: ValuationTypeSchema.default("ACTUAL_PAID"),
});

export const MapSessionInvestmentLineInputSchema = MapSessionLineBaseInputSchema;

export type MapSessionInvestmentLineInput = z.infer<
  typeof MapSessionInvestmentLineInputSchema
>;

/**
 * Revenue category is a string for data-driven expansion (MVP_SPEC §10).
 * Seed examples: Currency, Tablets, Oils, Waystones, Invitations, Fragments,
 * Divination Cards, Essences, Fossils, Other.
 */
export const MapSessionRevenueLineInputSchema =
  MapSessionLineBaseInputSchema.extend({
    category: z.string().min(1),
  });

export type MapSessionRevenueLineInput = z.infer<
  typeof MapSessionRevenueLineInputSchema
>;

export const MapSessionInvestmentLineSchema =
  MapSessionInvestmentLineInputSchema.extend({
    id: z.string().min(1),
    /** quantity × unitValueChaos; compute-on-write via calc engine. */
    lineTotalChaos: DecimalStringSchema,
  });

export type MapSessionInvestmentLine = z.infer<
  typeof MapSessionInvestmentLineSchema
>;

export const MapSessionRevenueLineSchema =
  MapSessionRevenueLineInputSchema.extend({
    id: z.string().min(1),
    lineTotalChaos: DecimalStringSchema,
  });

export type MapSessionRevenueLine = z.infer<typeof MapSessionRevenueLineSchema>;

/** Duration inputs — discriminated by method (ADR-006). Default: EXTRAPOLATED. */
export const MapSessionDurationExtrapolatedInputSchema = z.object({
  durationMethod: z.literal("EXTRAPOLATED"),
  sampleMapsCompleted: z.number().int().positive(),
  sampleDurationMinutes: PositiveDecimalStringSchema,
});

export const MapSessionDurationObservedInputSchema = z
  .object({
    durationMethod: z.literal("OBSERVED"),
    startedAt: z.string().datetime(),
    endedAt: z.string().datetime(),
  })
  .refine(
    (value) => new Date(value.endedAt) >= new Date(value.startedAt),
    { message: "endedAt must not precede startedAt", path: ["endedAt"] },
  );

export const MapSessionDurationManualInputSchema = z.object({
  durationMethod: z.literal("MANUAL"),
  manualDurationMinutes: DecimalStringSchema,
});

export const MapSessionDurationInputSchema = z.discriminatedUnion(
  "durationMethod",
  [
    MapSessionDurationExtrapolatedInputSchema,
    MapSessionDurationObservedInputSchema,
    MapSessionDurationManualInputSchema,
  ],
);

export type MapSessionDurationInput = z.infer<
  typeof MapSessionDurationInputSchema
>;

const MapSessionWritableFieldsSchema = z.object({
  strategyId: z.string().min(1),
  mapsCompleted: z.number().int().nonnegative(),
  /**
   * Cost of one map/waystone in Chaos (required).
   * Session map investment = mapsCompleted × mapUnitCostChaos.
   */
  mapUnitCostChaos: DecimalStringSchema,
  /** Divine ↔ Chaos snapshot for this map session (ADR-003). */
  divineRateChaos: DecimalStringSchema,
  notes: z.string().optional(),
  investmentLines: z
    .array(MapSessionInvestmentLineInputSchema)
    .max(MAX_MAP_SESSION_INVESTMENT_LINES)
    .default([]),
  revenueLines: z
    .array(MapSessionRevenueLineInputSchema)
    .max(MAX_MAP_SESSION_REVENUE_LINES)
    .default([]),
});

/** POST /api/map-sessions body */
export const CreateMapSessionBodySchema = MapSessionWritableFieldsSchema.and(
  MapSessionDurationInputSchema,
);

export type CreateMapSessionBody = z.infer<typeof CreateMapSessionBodySchema>;

/** PUT /api/map-sessions/:id — full replace (MVP). */
export const UpdateMapSessionBodySchema = CreateMapSessionBodySchema;

export type UpdateMapSessionBody = z.infer<typeof UpdateMapSessionBodySchema>;

/** Calculated fields on MapSession responses (ADR-008 / ADR-018). */
export const MapSessionCalculatedFieldsSchema = z.object({
  /**
   * mapsCompleted × mapUnitCostChaos + sum(investment line totals).
   * Map cost is never optional in this total.
   */
  totalInvestmentChaos: DecimalStringSchema,
  totalRevenueChaos: DecimalStringSchema,
  profitChaos: DecimalStringSchema,
  /** mapsCompleted × mapUnitCostChaos (calculated; not user-edited). */
  mapInvestmentChaos: DecimalStringSchema,
  effectiveDurationMinutes: DecimalStringSchema,
  durationMethodLabel: DurationMethodLabelSchema,
  profitPerHourChaos: NullableDecimalStringSchema,
  profitPerMapChaos: NullableDecimalStringSchema,
  mapsPerHour: NullableDecimalStringSchema,
  roiPercent: NullableDecimalStringSchema,
  /** Secondary display; null when unavailable. */
  profitDivineApprox: NullableDecimalStringSchema,
});

export type MapSessionCalculatedFields = z.infer<
  typeof MapSessionCalculatedFieldsSchema
>;

/** Persisted MapSession resource (response shape). */
export const MapSessionSchema = z
  .object({
    id: z.string().min(1),
    strategyId: z.string().min(1),
    mapsCompleted: z.number().int().nonnegative(),
    mapUnitCostChaos: DecimalStringSchema,
    divineRateChaos: DecimalStringSchema,
    notes: z.string().optional(),
    investmentLines: z
      .array(MapSessionInvestmentLineSchema)
      .max(MAX_MAP_SESSION_INVESTMENT_LINES),
    revenueLines: z
      .array(MapSessionRevenueLineSchema)
      .max(MAX_MAP_SESSION_REVENUE_LINES),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .and(MapSessionDurationInputSchema)
  .and(MapSessionCalculatedFieldsSchema);

export type MapSession = z.infer<typeof MapSessionSchema>;

/** GET /api/map-sessions */
export const MapSessionListResponseSchema = z.object({
  mapSessions: z.array(MapSessionSchema),
});

export type MapSessionListResponse = z.infer<
  typeof MapSessionListResponseSchema
>;

/** POST 201 / GET 200 / PUT 200 */
export const MapSessionResponseSchema = MapSessionSchema;

export type MapSessionResponse = z.infer<typeof MapSessionResponseSchema>;

/** Path param for /api/map-sessions/:id */
export const MapSessionIdParamSchema = z.object({
  id: z.string().min(1),
});

export type MapSessionIdParam = z.infer<typeof MapSessionIdParamSchema>;
