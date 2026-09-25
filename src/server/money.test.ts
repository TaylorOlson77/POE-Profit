import { decimalToWire } from "./money";

describe("decimalToWire", () => {
  it("keeps the engine string, including scale past two decimal places", () => {
    expect(decimalToWire("1.005")).toBe("1.005");
  });

  it("strips storage scale without turning the value into a number", () => {
    expect(decimalToWire("212.00000000")).toBe("212");
    expect(decimalToWire("0.00000001")).toBe("0.00000001");
  });
});
