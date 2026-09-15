import Decimal from "decimal.js";
import { isCalcModuleReady, lineTotal } from "./index";

describe("calc module smoke", () => {
  it("imports the calc module and reports ready", () => {
    expect(isCalcModuleReady()).toBe(true);
  });

  it("uses decimal.js for a stub line total", () => {
    const total = lineTotal(40, "7");
    expect(total).toBeInstanceOf(Decimal);
    expect(total.toString()).toBe("280");
  });

  it("handles fractional quantities without float noise", () => {
    const total = lineTotal("8.5", "0.20");
    expect(total.toString()).toBe("1.7");
  });
});
