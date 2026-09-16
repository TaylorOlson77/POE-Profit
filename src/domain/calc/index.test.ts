import Decimal from "decimal.js";
import {
  calculateSessionMoney,
  calculateStrategyCosts,
  lineTotal,
  profit,
  sumLineTotals,
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
  it("multiplies each enhancement quantity by unit cost, then adds map cost", () => {
    // Guard: 2×100 + 1×10 = 210, plus map 2 = 212. Not 2+100+10 = 112.
    const result = calculateStrategyCosts({
      mapUnitCostChaos: "2",
      enhancementLines: [
        { quantity: "2", unitCostChaos: "100" },
        { quantity: "1", unitCostChaos: "10" },
      ],
    });

    expect(result.enhancementLineTotals).toHaveLength(2);
    expectDecimal(result.enhancementLineTotals[0], "200");
    expectDecimal(result.enhancementLineTotals[1], "10");
    expectDecimal(result.estimatedCostPerMapChaos, "212");
    expect(
      result.estimatedCostPerMapChaos.equals(new Decimal("2").plus("100").plus("10")),
    ).toBe(false);
  });

  it("matches the seed strategy: waystone 2 + 1×7 + 1×1 = 10c/map", () => {
    const result = calculateStrategyCosts({
      mapUnitCostChaos: "2",
      enhancementLines: [
        { quantity: "1", unitCostChaos: "7" },
        { quantity: "1", unitCostChaos: "1" },
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
