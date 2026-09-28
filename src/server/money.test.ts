import Decimal from "decimal.js";
import { decimalToWire, fitsMoneyColumn, nullableDecimalToWire } from "./money";

describe("decimalToWire", () => {
  it("keeps the engine string, including scale past two decimal places", () => {
    expect(decimalToWire("1.005")).toBe("1.005");
  });

  it("strips storage scale without turning the value into a number", () => {
    expect(decimalToWire("212.00000000")).toBe("212");
    expect(decimalToWire("0.00000001")).toBe("0.00000001");
  });
});

describe("fitsMoneyColumn", () => {
  it("rejects a product that exceeds NUMERIC(20, 8)", () => {
    expect(fitsMoneyColumn(new Decimal("999999999999").times(2))).toBe(false);
  });

  it("accepts the largest value the column can store", () => {
    expect(fitsMoneyColumn("999999999999.99999999")).toBe(true);
    expect(fitsMoneyColumn("-999999999999.99999999")).toBe(true);
  });

  it("rejects a value that rounds up to 10^12", () => {
    expect(fitsMoneyColumn("999999999999.999999995")).toBe(false);
  });
});

describe("nullableDecimalToWire", () => {
  it("keeps null and strips a signed storage-scale value", () => {
    expect(nullableDecimalToWire(null)).toBeNull();
    expect(nullableDecimalToWire("-80.00000000")).toBe("-80");
  });
});
