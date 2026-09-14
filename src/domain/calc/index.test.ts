import { isCalcModuleReady } from "./index";

describe("calc module smoke", () => {
  it("imports the calc module and reports ready", () => {
    expect(isCalcModuleReady()).toBe(true);
  });
});
