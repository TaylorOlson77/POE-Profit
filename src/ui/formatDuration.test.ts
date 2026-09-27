import {
  formatChaosPerHourOrNA,
  formatDuration,
  formatDurationMinutes,
  formatPercentOrNA,
  formatPlainOrNA,
} from "./formatDuration";

describe("formatDuration", () => {
  it("splits whole hours and minutes", () => {
    expect(formatDuration("80")).toBe("1h 20m");
    expect(formatDurationMinutes("80")).toBe("80 min");
  });

  it("keeps zero as 0m", () => {
    expect(formatDuration("0")).toBe("0m");
  });

  it("omits hours when the session is under an hour", () => {
    expect(formatDuration("45")).toBe("45m");
  });

  it("keeps a fractional remainder after display rounding", () => {
    expect(formatDuration("90.5")).toBe("1h 30.5m");
  });

  it("rolls sub-minute noise into the rounded minute", () => {
    expect(formatDuration("119.996")).toBe("2h 0m");
    expect(formatDuration("0.004")).toBe("0m");
  });
});

describe("nullable session rates", () => {
  it("renders null metrics as N/A", () => {
    expect(formatPlainOrNA(null)).toBe("N/A");
    expect(formatPercentOrNA(null)).toBe("N/A");
    expect(formatChaosPerHourOrNA(null)).toBe("N/A");
  });

  it("formats present rates with display rounding", () => {
    expect(formatPlainOrNA("30.004")).toBe("30");
    expect(formatPercentOrNA("442.556")).toBe("442.56%");
    expect(formatChaosPerHourOrNA("1705.1")).toBe("1705.1c/h");
  });
});
