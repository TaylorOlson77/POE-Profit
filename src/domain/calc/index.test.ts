import Decimal from "decimal.js";
import {
  calculateSession,
  calculateSessionMoney,
  calculateStrategyCosts,
  effectiveDurationMinutes,
  lineTotal,
  mapsPerHour,
  profit,
  profitDivineApprox,
  profitPerHourChaos,
  profitPerMapChaos,
  roiPercent,
  roundForDisplay,
  sumLineTotals,
  calculateDivineToChaos,
} from "./index";

function expectDecimal(actual: Decimal, expected: Decimal.Value) {
  expect(actual.equals(new Decimal(expected))).toBe(true);
}

describe("lineTotal", () => {
  it("multiplies integer quantity by unit value", () => {
    expectDecimal(lineTotal("40", "7"), "280");
  });

  it("handles fractional quantities without float noise", () => {
    expectDecimal(lineTotal("8.5", "0.20"), "1.7");
  });

  it("handles decimal unit prices", () => {
    expectDecimal(lineTotal("60", "0.26"), "15.6");
  });

  it("returns 0 when quantity is 0", () => {
    expectDecimal(lineTotal("0", "7"), "0");
  });

  it("keeps large values exact", () => {
    expectDecimal(lineTotal("1000000", "999.999999"), "999999999");
  });
});

describe("sumLineTotals", () => {
  it("sums multiple line totals", () => {
    expectDecimal(sumLineTotals(["50", "15.6", "40"]), "105.6");
  });

  it("returns 0 for an empty list", () => {
    expectDecimal(sumLineTotals([]), "0");
  });
});

describe("profit", () => {
  it("is revenue minus investment", () => {
    expectDecimal(profit("2320", "400"), "1920");
  });

  it("can be negative", () => {
    expectDecimal(profit("100", "150"), "-50");
  });

  it("can be zero", () => {
    expectDecimal(profit("400", "400"), "0");
  });

  it("matches the TEST_STRATEGY §6.1 golden aggregate", () => {
    expectDecimal(profit("2787.09", "513.60"), "2273.49");
  });
});

describe("IEEE float contrast (why decimal.js)", () => {
  it("native floats miss 0.1 + 0.2; Decimal does not", () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expectDecimal(new Decimal("0.1").plus("0.2"), "0.3");
  });
});

describe("calculateStrategyCosts", () => {
  it("per-map cost is waystone plus quantity × unit cost divided by uses", () => {
    // 2×100/10 + 1×10/10 + waystone 2 = 23. Not the undivided 212.
    const result = calculateStrategyCosts({
      mapUnitCostChaos: "2",
      enhancementLines: [
        { quantity: "2", unitCostChaos: "100", uses: 10 },
        { quantity: "1", unitCostChaos: "10", uses: 10 },
      ],
    });

    expect(result.enhancementLineTotals).toHaveLength(2);
    expectDecimal(result.enhancementLineTotals[0], "20");
    expectDecimal(result.enhancementLineTotals[1], "1");
    expectDecimal(result.estimatedCostPerMapChaos, "23");
    expect(result.estimatedCostPerMapChaos.equals(new Decimal("212"))).toBe(
      false,
    );
  });

  it("charges 10c of a 100c tablet that lasts 10 uses", () => {
    const result = calculateStrategyCosts({
      mapUnitCostChaos: "2",
      enhancementLines: [{ quantity: "1", unitCostChaos: "100", uses: 10 }],
    });

    expectDecimal(result.enhancementLineTotals[0], "10");
    expectDecimal(result.estimatedCostPerMapChaos, "12");
  });

  it("charges 20c when that tablet lasts 5 uses", () => {
    const result = calculateStrategyCosts({
      mapUnitCostChaos: "2",
      enhancementLines: [{ quantity: "1", unitCostChaos: "100", uses: 5 }],
    });

    expectDecimal(result.enhancementLineTotals[0], "20");
    expectDecimal(result.estimatedCostPerMapChaos, "22");
  });

  it("multiplies quantity before dividing by uses", () => {
    const result = calculateStrategyCosts({
      mapUnitCostChaos: "2",
      enhancementLines: [{ quantity: "2", unitCostChaos: "100", uses: 10 }],
    });

    expectDecimal(result.enhancementLineTotals[0], "20");
    expectDecimal(result.estimatedCostPerMapChaos, "22");
  });

  it("leaves quantity times unit cost when uses is 1", () => {
    const result = calculateStrategyCosts({
      mapUnitCostChaos: "2",
      enhancementLines: [{ quantity: "1", unitCostChaos: "100", uses: 1 }],
    });

    expectDecimal(result.enhancementLineTotals[0], "100");
    expectDecimal(result.estimatedCostPerMapChaos, "102");
  });

  it("matches the seed strategy: waystone 2 + 1×7 + 1×1 at 1 use = 10c/map", () => {
    const result = calculateStrategyCosts({
      mapUnitCostChaos: "2",
      enhancementLines: [
        { quantity: "1", unitCostChaos: "7", uses: 1 },
        { quantity: "1", unitCostChaos: "1", uses: 1 },
      ],
    });

    expectDecimal(result.estimatedCostPerMapChaos, "10");
  });

  it("uses map unit cost alone when there are no enhancement lines", () => {
    const result = calculateStrategyCosts({
      mapUnitCostChaos: "2",
      enhancementLines: [],
    });

    expect(result.enhancementLineTotals).toEqual([]);
    expectDecimal(result.estimatedCostPerMapChaos, "2");
  });
});

describe("calculateSessionMoney", () => {
  it("adds map spend (mapsCompleted × mapUnitCost) to investment lines, not as a line", () => {
    // Seed session: 40×2 map = 80; lines 40×7 + 40×1 = 320; total 400.
    // Revenue 8×200 + 30×14 + 60×5 = 2320; profit 1920.
    const result = calculateSessionMoney({
      mapsCompleted: 40,
      mapUnitCostChaos: "2",
      investmentLines: [
        { quantity: "40", unitValueChaos: "7" },
        { quantity: "40", unitValueChaos: "1" },
      ],
      revenueLines: [
        { quantity: "8", unitValueChaos: "200" },
        { quantity: "30", unitValueChaos: "14" },
        { quantity: "60", unitValueChaos: "5" },
      ],
    });

    expectDecimal(result.mapInvestmentChaos, "80");
    expectDecimal(result.investmentLineTotals[0], "280");
    expectDecimal(result.investmentLineTotals[1], "40");
    expectDecimal(result.totalInvestmentChaos, "400");
    expectDecimal(result.totalRevenueChaos, "2320");
    expectDecimal(result.profitChaos, "1920");
  });

  it("still counts map spend when investment and revenue lines are empty", () => {
    const result = calculateSessionMoney({
      mapsCompleted: 40,
      mapUnitCostChaos: "2",
      investmentLines: [],
      revenueLines: [],
    });

    expectDecimal(result.mapInvestmentChaos, "80");
    expectDecimal(result.totalInvestmentChaos, "80");
    expectDecimal(result.totalRevenueChaos, "0");
    expectDecimal(result.profitChaos, "-80");
  });

  it("is zero across the board when no maps and no lines", () => {
    const result = calculateSessionMoney({
      mapsCompleted: 0,
      mapUnitCostChaos: "2",
      investmentLines: [],
      revenueLines: [],
    });

    expectDecimal(result.mapInvestmentChaos, "0");
    expectDecimal(result.totalInvestmentChaos, "0");
    expectDecimal(result.totalRevenueChaos, "0");
    expectDecimal(result.profitChaos, "0");
  });
});

const SEED_SESSION_MONEY = {
  mapsCompleted: 40,
  mapUnitCostChaos: "2",
  investmentLines: [
    { quantity: "40", unitValueChaos: "7" },
    { quantity: "40", unitValueChaos: "1" },
  ],
  revenueLines: [
    { quantity: "8", unitValueChaos: "200" },
    { quantity: "30", unitValueChaos: "14" },
    { quantity: "60", unitValueChaos: "5" },
  ],
} as const;

const SEED_SESSION = {
  ...SEED_SESSION_MONEY,
  divineRateChaos: "200",
} as const;

describe("effectiveDurationMinutes", () => {
  it("extrapolates sample duration across maps completed", () => {
    const result = effectiveDurationMinutes(
      {
        durationMethod: "EXTRAPOLATED",
        sampleMapsCompleted: 10,
        sampleDurationMinutes: "20",
      },
      40,
    );

    expectDecimal(result.minutes, "80");
    expect(result.durationMethodLabel).toBe("Extrapolated");
  });

  it("uses observed wall-clock minutes", () => {
    const result = effectiveDurationMinutes(
      {
        durationMethod: "OBSERVED",
        startedAt: "2026-01-01T00:00:00.000Z",
        endedAt: "2026-01-01T01:20:00.000Z",
      },
      40,
    );

    expectDecimal(result.minutes, "80");
    expect(result.durationMethodLabel).toBe("Observed");
  });

  it("is 0 when observed start and end are the same", () => {
    const result = effectiveDurationMinutes(
      {
        durationMethod: "OBSERVED",
        startedAt: "2026-01-01T00:00:00.000Z",
        endedAt: "2026-01-01T00:00:00.000Z",
      },
      40,
    );

    expectDecimal(result.minutes, "0");
  });

  it("uses manual duration as-is", () => {
    const result = effectiveDurationMinutes(
      {
        durationMethod: "MANUAL",
        manualDurationMinutes: "80",
      },
      40,
    );

    expectDecimal(result.minutes, "80");
    expect(result.durationMethodLabel).toBe("Manual");
  });

  it("allows manual duration of 0", () => {
    const result = effectiveDurationMinutes(
      {
        durationMethod: "MANUAL",
        manualDurationMinutes: "0",
      },
      40,
    );

    expectDecimal(result.minutes, "0");
    expect(result.durationMethodLabel).toBe("Manual");
  });

  it("throws when extrapolated sample maps are 0", () => {
    expect(() =>
      effectiveDurationMinutes(
        {
          durationMethod: "EXTRAPOLATED",
          sampleMapsCompleted: 0,
          sampleDurationMinutes: "20",
        },
        40,
      ),
    ).toThrow("sampleMapsCompleted must be greater than zero");
  });

  it("throws when extrapolated sample duration is 0", () => {
    expect(() =>
      effectiveDurationMinutes(
        {
          durationMethod: "EXTRAPOLATED",
          sampleMapsCompleted: 10,
          sampleDurationMinutes: "0",
        },
        40,
      ),
    ).toThrow("sampleDurationMinutes must be greater than zero");
  });

  it("throws when observed end precedes start", () => {
    expect(() =>
      effectiveDurationMinutes(
        {
          durationMethod: "OBSERVED",
          startedAt: "2026-01-01T01:20:00.000Z",
          endedAt: "2026-01-01T00:00:00.000Z",
        },
        40,
      ),
    ).toThrow("endedAt must not precede startedAt");
  });
});

describe("rate metrics and ROI", () => {
  it("matches the seed session rates", () => {
    expectDecimal(profitPerHourChaos("1920", "80") as Decimal, "1440");
    expectDecimal(profitPerMapChaos("1920", 40) as Decimal, "48");
    expectDecimal(mapsPerHour(40, "80") as Decimal, "30");
    expectDecimal(roiPercent("1920", "400") as Decimal, "480");
  });

  it("locks TEST_STRATEGY §6.1 golden rates at full precision", () => {
    const profitChaos = new Decimal("2273.49");
    const minutes = new Decimal("99");
    const investment = new Decimal("513.60");

    expectDecimal(
      profitPerHourChaos(profitChaos, minutes) as Decimal,
      profitChaos.times(60).div(minutes),
    );
    expectDecimal(profitPerMapChaos(profitChaos, 40) as Decimal, "56.83725");
    expectDecimal(
      mapsPerHour(40, minutes) as Decimal,
      new Decimal(40).times(60).div(minutes),
    );
    expectDecimal(
      roiPercent(profitChaos, investment) as Decimal,
      profitChaos.div(investment).times(100),
    );
  });

  it("returns null profit/hour and maps/hour when duration is 0", () => {
    expect(profitPerHourChaos("1920", "0")).toBeNull();
    expect(mapsPerHour(40, "0")).toBeNull();
    expectDecimal(profitPerMapChaos("1920", 40) as Decimal, "48");
  });

  it("returns null profit/map and maps/hour when maps are 0", () => {
    expect(profitPerMapChaos("100", 0)).toBeNull();
    expect(mapsPerHour(0, "80")).toBeNull();
    expectDecimal(profitPerHourChaos("100", "80") as Decimal, "75");
  });

  it("returns null ROI when investment is 0, including zero profit", () => {
    expect(roiPercent("100", "0")).toBeNull();
    expect(roiPercent("0", "0")).toBeNull();
  });

  it("keeps signed rates when profit is negative", () => {
    expectDecimal(profitPerHourChaos("-80", "80") as Decimal, "-60");
    expectDecimal(profitPerMapChaos("-80", 40) as Decimal, "-2");
    expectDecimal(roiPercent("-80", "80") as Decimal, "-100");
  });
});

describe("profitDivineApprox", () => {
  it("divides seed profit by the stored rate: 1920 / 200 = 9.6", () => {
    expectDecimal(profitDivineApprox("1920", "200") as Decimal, "9.6");
  });

  it("keeps the spec example unrounded: 2273.49 / 200 = 11.36745", () => {
    expectDecimal(profitDivineApprox("2273.49", "200") as Decimal, "11.36745");
  });

  it("follows the session snapshot, so the same profit and a different rate differ", () => {
    expectDecimal(profitDivineApprox("1920", "100") as Decimal, "19.2");
    expectDecimal(profitDivineApprox("1920", "200") as Decimal, "9.6");
  });

  it("returns null when the rate is zero or negative", () => {
    expect(profitDivineApprox("1920", "0")).toBeNull();
    expect(profitDivineApprox("1920", "-1")).toBeNull();
  });

  it("returns 0 when profit is zero and the rate is positive", () => {
    expectDecimal(profitDivineApprox("0", "200") as Decimal, "0");
  });

  it("returns a negative quotient when profit is negative", () => {
    expectDecimal(profitDivineApprox("-80", "200") as Decimal, "-0.4");
  });

  it("keeps a repeating quotient at full precision", () => {
    expectDecimal(profitDivineApprox("100", "3") as Decimal, new Decimal("100").div("3"));
  });
});

describe("roundForDisplay", () => {
  it("rounds the spec Divine example to 11.37", () => {
    const exact = profitDivineApprox("2273.49", "200") as Decimal;
    expect(roundForDisplay(exact).toString()).toBe("11.37");
    expectDecimal(exact, "11.36745");
  });

  it("rounds golden rate metrics to 2 dp half up", () => {
    const profitChaos = new Decimal("2273.49");
    const minutes = new Decimal("99");
    const investment = new Decimal("513.60");

    expect(roundForDisplay(profitChaos.times(60).div(minutes)).toString()).toBe(
      "1377.87",
    );
    expect(roundForDisplay(profitChaos.div(40)).toString()).toBe("56.84");
    expect(
      roundForDisplay(profitChaos.div(investment).times(100)).toString(),
    ).toBe("442.66");
  });

  it("trims trailing zeros so 20.4 stays 20.4", () => {
    expect(roundForDisplay("20.4").toString()).toBe("20.4");
    expect(roundForDisplay("20.40").toString()).toBe("20.4");
  });

  it("rounds a half-up boundary away from zero", () => {
    expect(roundForDisplay("1.225").toString()).toBe("1.23");
    expect(roundForDisplay("-1.225").toString()).toBe("-1.23");
  });
});

describe("calculateSession", () => {
  it("composes seed money, extrapolated duration, rates, and Divine approx", () => {
    const result = calculateSession({
      ...SEED_SESSION,
      duration: {
        durationMethod: "EXTRAPOLATED",
        sampleMapsCompleted: 10,
        sampleDurationMinutes: "20",
      },
    });

    expectDecimal(result.profitChaos, "1920");
    expectDecimal(result.effectiveDurationMinutes, "80");
    expect(result.durationMethodLabel).toBe("Extrapolated");
    expectDecimal(result.profitPerHourChaos as Decimal, "1440");
    expectDecimal(result.profitPerMapChaos as Decimal, "48");
    expectDecimal(result.mapsPerHour as Decimal, "30");
    expectDecimal(result.roiPercent as Decimal, "480");
    expectDecimal(result.profitDivineApprox as Decimal, "9.6");
  });

  it("labels observed duration without mixing methods", () => {
    const result = calculateSession({
      ...SEED_SESSION,
      duration: {
        durationMethod: "OBSERVED",
        startedAt: "2026-01-01T00:00:00.000Z",
        endedAt: "2026-01-01T01:20:00.000Z",
      },
    });

    expectDecimal(result.effectiveDurationMinutes, "80");
    expect(result.durationMethodLabel).toBe("Observed");
  });

  it("labels manual duration", () => {
    const result = calculateSession({
      ...SEED_SESSION,
      duration: {
        durationMethod: "MANUAL",
        manualDurationMinutes: "80",
      },
    });

    expect(result.durationMethodLabel).toBe("Manual");
    expectDecimal(result.effectiveDurationMinutes, "80");
  });

  it("nulls duration-based rates when effective duration is 0", () => {
    const result = calculateSession({
      ...SEED_SESSION,
      duration: {
        durationMethod: "MANUAL",
        manualDurationMinutes: "0",
      },
    });

    expectDecimal(result.effectiveDurationMinutes, "0");
    expect(result.profitPerHourChaos).toBeNull();
    expect(result.mapsPerHour).toBeNull();
    expectDecimal(result.profitPerMapChaos as Decimal, "48");
  });

  it("nulls map-based rates when mapsCompleted is 0", () => {
    const result = calculateSession({
      mapsCompleted: 0,
      mapUnitCostChaos: "2",
      investmentLines: [],
      revenueLines: [{ quantity: "1", unitValueChaos: "100" }],
      duration: {
        durationMethod: "MANUAL",
        manualDurationMinutes: "80",
      },
      divineRateChaos: "200",
    });

    expect(result.profitPerMapChaos).toBeNull();
    expect(result.mapsPerHour).toBeNull();
    expect(result.roiPercent).toBeNull();
    expectDecimal(result.profitPerHourChaos as Decimal, "75");
    expectDecimal(result.profitDivineApprox as Decimal, "0.5");
  });

  it("nulls Divine approx when the stored rate is 0 and leaves Chaos profit exact", () => {
    const result = calculateSession({
      ...SEED_SESSION,
      divineRateChaos: "0",
      duration: {
        durationMethod: "MANUAL",
        manualDurationMinutes: "80",
      },
    });

    expect(result.profitDivineApprox).toBeNull();
    expectDecimal(result.profitChaos, "1920");
    expectDecimal(result.profitPerHourChaos as Decimal, "1440");
  });
});

describe("calculateDivineToChaos", () => {
  it("multiplies a divine amount by the rate", () => {
    expectDecimal(calculateDivineToChaos("10", "200") as Decimal, "2000");
  });

  it("multiplies a fractional amount by a fractional rate", () => {
    expectDecimal(calculateDivineToChaos("50.5", "2.5") as Decimal, "126.25");
  });

  it("returns null when the rate is missing", () => {
    expect(calculateDivineToChaos("100", null)).toBeNull();
  });

  it("returns null when the amount is missing", () => {
    expect(calculateDivineToChaos(null, "2")).toBeNull();
  });

  it("returns null when the amount is negative", () => {
    expect(calculateDivineToChaos("-100", "2")).toBeNull();
  });

  it("returns null when the rate is negative", () => {
    expect(calculateDivineToChaos("100", "-2")).toBeNull();
  });

  it("returns null when the rate is zero", () => {
    expect(calculateDivineToChaos("100", "0")).toBeNull();
  });

  it("returns zero when the amount is zero", () => {
    expectDecimal(calculateDivineToChaos("0", "2") as Decimal, "0");
  });
});