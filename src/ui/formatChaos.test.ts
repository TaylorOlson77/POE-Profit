import { formatChaos, formatChaosOrNA } from "./formatChaos";

describe("formatChaos", () => {
  it("trims trailing zeros after 2dp half-up rounding", () => {
    expect(formatChaos("20.40")).toBe("20.4c");
  });

  it("rounds a sub-chaos fraction to 0c", () => {
    expect(formatChaos("0.004")).toBe("0c");
  });

  it("keeps zero as 0c", () => {
    expect(formatChaos("0")).toBe("0c");
  });
});

describe("formatChaosOrNA", () => {
  it("renders null metrics as N/A", () => {
    expect(formatChaosOrNA(null)).toBe("N/A");
    expect(formatChaosOrNA("-50")).toBe("-50c");
  });
});
