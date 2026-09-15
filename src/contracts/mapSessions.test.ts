import {
  CreateMapSessionBodySchema,
  MapSessionDurationObservedInputSchema,
  MapSessionSchema,
} from "./index";

describe("MapSession contracts", () => {
  const createdAt = "2026-09-14T20:00:00.000Z";
  const updatedAt = "2026-09-14T21:20:00.000Z";

  it("accepts extrapolated create with required mapUnitCostChaos", () => {
    const parsed = CreateMapSessionBodySchema.safeParse({
      strategyId: "strat_1",
      mapsCompleted: 40,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      notes: "Good session",
      durationMethod: "EXTRAPOLATED",
      sampleMapsCompleted: 10,
      sampleDurationMinutes: "20",
      investmentLines: [
        {
          name: "Gilded Tablet",
          quantity: "40",
          unitValueChaos: "7",
          priceRecordedAt: "2026-09-14T19:00:00.000Z",
        },
      ],
      revenueLines: [
        {
          name: "Divine Orb",
          category: "Currency",
          quantity: "1",
          unitValueChaos: "200",
          priceRecordedAt: "2026-09-14T21:00:00.000Z",
        },
      ],
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects create body missing mapUnitCostChaos", () => {
    const parsed = CreateMapSessionBodySchema.safeParse({
      strategyId: "strat_1",
      mapsCompleted: 40,
      divineRateChaos: "200",
      durationMethod: "MANUAL",
      manualDurationMinutes: "80",
      investmentLines: [],
      revenueLines: [],
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts observed duration with valid timestamps", () => {
    const parsed = CreateMapSessionBodySchema.safeParse({
      strategyId: "strat_1",
      mapsCompleted: 30,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      durationMethod: "OBSERVED",
      startedAt: "2026-09-14T18:00:00.000Z",
      endedAt: "2026-09-14T19:12:00.000Z",
      investmentLines: [],
      revenueLines: [],
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects observed duration when endedAt precedes startedAt", () => {
    const parsed = MapSessionDurationObservedInputSchema.safeParse({
      durationMethod: "OBSERVED",
      startedAt: "2026-09-14T19:00:00.000Z",
      endedAt: "2026-09-14T18:00:00.000Z",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects extrapolated duration with zero sample maps", () => {
    const parsed = CreateMapSessionBodySchema.safeParse({
      strategyId: "strat_1",
      mapsCompleted: 40,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      durationMethod: "EXTRAPOLATED",
      sampleMapsCompleted: 0,
      sampleDurationMinutes: "20",
      investmentLines: [],
      revenueLines: [],
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts manual duration", () => {
    const parsed = CreateMapSessionBodySchema.safeParse({
      strategyId: "strat_1",
      mapsCompleted: 40,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      durationMethod: "MANUAL",
      manualDurationMinutes: "80",
      investmentLines: [],
      revenueLines: [],
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts a full MapSession response with map investment in calculated totals", () => {
    // 40 maps × 2c = 80 mapInvestment; + 280 tablet lines = 360 total investment
    const parsed = MapSessionSchema.safeParse({
      id: "ms_1",
      strategyId: "strat_1",
      mapsCompleted: 40,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      notes: "Example session",
      durationMethod: "EXTRAPOLATED",
      sampleMapsCompleted: 10,
      sampleDurationMinutes: "20",
      investmentLines: [
        {
          id: "inv_1",
          name: "Gilded Tablet",
          quantity: "40",
          unitValueChaos: "7",
          priceRecordedAt: "2026-09-14T19:00:00.000Z",
          priceSource: "MANUAL",
          valuationType: "ACTUAL_PAID",
          lineTotalChaos: "280",
        },
      ],
      revenueLines: [
        {
          id: "rev_1",
          name: "Divine Orb",
          category: "Currency",
          quantity: "1",
          unitValueChaos: "200",
          priceRecordedAt: "2026-09-14T21:00:00.000Z",
          priceSource: "MANUAL",
          valuationType: "ACTUAL_PAID",
          lineTotalChaos: "200",
        },
      ],
      mapInvestmentChaos: "80",
      totalInvestmentChaos: "360",
      totalRevenueChaos: "2787.09",
      profitChaos: "2427.09",
      effectiveDurationMinutes: "80",
      durationMethodLabel: "Extrapolated",
      profitPerHourChaos: "1820.3175",
      profitPerMapChaos: "60.67725",
      mapsPerHour: "30",
      roiPercent: "674.1916666666667",
      profitDivineApprox: "12.13545",
      createdAt,
      updatedAt,
    });

    expect(parsed.success).toBe(true);
  });

  it("allows null calculated rate metrics when unavailable", () => {
    const parsed = MapSessionSchema.safeParse({
      id: "ms_zero",
      strategyId: "strat_1",
      mapsCompleted: 0,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      durationMethod: "MANUAL",
      manualDurationMinutes: "0",
      investmentLines: [],
      revenueLines: [],
      mapInvestmentChaos: "0",
      totalInvestmentChaos: "0",
      totalRevenueChaos: "0",
      profitChaos: "0",
      effectiveDurationMinutes: "0",
      durationMethodLabel: "Manual",
      profitPerHourChaos: null,
      profitPerMapChaos: null,
      mapsPerHour: null,
      roiPercent: null,
      profitDivineApprox: null,
      createdAt,
      updatedAt,
    });

    expect(parsed.success).toBe(true);
  });
});
