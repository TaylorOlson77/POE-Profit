import { strategyLabels } from "./strategyLabels";

describe("strategyLabels", () => {
  it("a PoE1 strategy does not show uses", () => {
    expect(strategyLabels("POE1").showUses).toBe(false);
    expect(strategyLabels("POE2").showUses).toBe(true);
  });
});
