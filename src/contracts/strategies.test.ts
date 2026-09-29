import {
  CreateStrategyBodySchema,
  MAX_STRATEGY_ENHANCEMENT_LINES,
  StrategySchema,
} from "./index";

describe("Strategy contracts (per-map setup template)", () => {
  const createdAt = "2026-09-14T20:00:00.000Z";
  const updatedAt = "2026-09-14T20:00:00.000Z";

  it("accepts a valid PoE2 create body with waystone cost and tablets", () => {
    const parsed = CreateStrategyBodySchema.safeParse({
      name: "Expedition Tablet Farming",
      game: "POE2",
      description: "Tablet-focused expedition farming",
      mapNotes: "T16 waystones with quant focus",
      mapUnitCostChaos: "2",
      enhancementLines: [
        {
          name: "Expedition Tablet",
          modifierNotes: "remnants / runaway",
          quantity: "2",
          unitCostChaos: "100",
          uses: 10,
          sortOrder: 0,
        },
        {
          name: "Temple Tablet",
          quantity: "1",
          unitCostChaos: "10",
          uses: 10,
          sortOrder: 1,
        },
      ],
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts PoE1 scarab lines without modifierNotes", () => {
    const parsed = CreateStrategyBodySchema.safeParse({
      name: "Scarab Stack",
      game: "POE1",
      description: "Lineage + adversaries example",
      mapUnitCostChaos: "3",
      enhancementLines: [
        {
          name: "Scarab of Lineage",
          quantity: "2",
          unitCostChaos: "10",
          uses: 1,
        },
        {
          name: "Scarab of Adversaries",
          quantity: "1",
          unitCostChaos: "100",
          uses: 1,
        },
      ],
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects create body missing required mapUnitCostChaos", () => {
    const parsed = CreateStrategyBodySchema.safeParse({
      name: "No map cost",
      game: "POE2",
      description: "Missing waystone cost",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects create body missing required name", () => {
    const parsed = CreateStrategyBodySchema.safeParse({
      game: "POE2",
      description: "Missing name",
      mapUnitCostChaos: "2",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects invalid game values", () => {
    const parsed = CreateStrategyBodySchema.safeParse({
      name: "Test",
      game: "DIABLO",
      description: "Wrong game",
      mapUnitCostChaos: "1",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects float-like number costs (decimal strings required)", () => {
    const parsed = CreateStrategyBodySchema.safeParse({
      name: "Test",
      game: "POE2",
      description: "Bad cost wire type",
      mapUnitCostChaos: 2,
      enhancementLines: [
        {
          name: "Expedition Tablet",
          quantity: 1,
          unitCostChaos: 100,
        },
      ],
    });

    expect(parsed.success).toBe(false);
  });

  it(`rejects more than ${MAX_STRATEGY_ENHANCEMENT_LINES} enhancement lines`, () => {
    const enhancementLines = Array.from(
      { length: MAX_STRATEGY_ENHANCEMENT_LINES + 1 },
      (_, i) => ({
        name: `Line ${i}`,
        quantity: "1",
        unitCostChaos: "1",
        uses: 1,
      }),
    );

    const parsed = CreateStrategyBodySchema.safeParse({
      name: "Too many",
      game: "POE2",
      description: "Abuse / bug guard",
      mapUnitCostChaos: "1",
      enhancementLines,
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects a sort order above the database integer limit", () => {
    const line = {
      name: "Expedition Tablet",
      quantity: "1",
      unitCostChaos: "1",
      uses: 1,
    };
    const body = {
      name: "Sort cap",
      game: "POE2",
      description: "Integer column",
      mapUnitCostChaos: "1",
    };

    expect(
      CreateStrategyBodySchema.safeParse({
        ...body,
        enhancementLines: [{ ...line, sortOrder: 2_147_483_648 }],
      }).success,
    ).toBe(false);
    expect(
      CreateStrategyBodySchema.safeParse({
        ...body,
        enhancementLines: [{ ...line, sortOrder: 2_147_483_647 }],
      }).success,
    ).toBe(true);
  });

  it("rejects 0, a blank use count, a fraction, and a count above the integer cap", () => {
    const body = {
      name: "Uses",
      game: "POE2",
      description: "Use count",
      mapUnitCostChaos: "2",
    };
    const line = {
      name: "Expedition Tablet",
      quantity: "1",
      unitCostChaos: "100",
    };

    for (const uses of [0, 1.5, "", -1, 2_147_483_648]) {
      const parsed = CreateStrategyBodySchema.safeParse({
        ...body,
        enhancementLines: [{ ...line, uses }],
      });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(
          parsed.error.issues.some(
            (issue) =>
              issue.message === "Uses must be a whole number of at least 1",
          ),
        ).toBe(true);
      }
    }

    expect(
      CreateStrategyBodySchema.safeParse({
        ...body,
        enhancementLines: [{ ...line, uses: 1 }],
      }).success,
    ).toBe(true);
    expect(
      CreateStrategyBodySchema.safeParse({
        ...body,
        enhancementLines: [{ ...line, uses: 10 }],
      }).success,
    ).toBe(true);
  });

  it("accepts stored totals where uses of 1 leaves quantity × unit cost", () => {
    // Uses of 1: map 2 + 2×100/1 + 1×10/1 = 212
    const parsed = StrategySchema.safeParse({
      id: "strat_cost_math",
      name: "Cost math example",
      game: "POE2",
      description: "Fixture for per-map cost aggregation",
      mapUnitCostChaos: "2",
      enhancementLines: [
        {
          id: "line_1",
          name: "Expedition Tablet",
          quantity: "2",
          unitCostChaos: "100",
          uses: 1,
          lineTotalChaos: "200",
          sortOrder: 0,
        },
        {
          id: "line_2",
          name: "Temple Tablet",
          quantity: "1",
          unitCostChaos: "10",
          uses: 1,
          lineTotalChaos: "10",
          sortOrder: 1,
        },
      ],
      estimatedCostPerMapChaos: "212",
      createdAt,
      updatedAt,
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.estimatedCostPerMapChaos).toBe("212");
    }
  });

  it("accepts a full Strategy resource response with calculated fields", () => {
    const parsed = StrategySchema.safeParse({
      id: "strat_1",
      name: "Blight Farming",
      game: "POE2",
      description: "Blight tablet strategy",
      mapNotes: "T16",
      mapUnitCostChaos: "2",
      enhancementLines: [
        {
          id: "line_1",
          name: "Expedition Tablet",
          modifierNotes: "example mods",
          quantity: "2",
          unitCostChaos: "100",
          uses: 1,
          lineTotalChaos: "200",
          sortOrder: 0,
        },
      ],
      estimatedCostPerMapChaos: "202",
      createdAt,
      updatedAt,
    });

    expect(parsed.success).toBe(true);
  });
});
