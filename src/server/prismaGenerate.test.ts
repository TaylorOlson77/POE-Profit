import { lockedQueryEngineCanStay } from "./prismaGenerate";

const locked =
  "EPERM: operation not permitted, rename 'query_engine-windows.dll.node.tmp' -> 'query_engine-windows.dll.node'";

describe("lockedQueryEngineCanStay", () => {
  it("keeps the engine when generate cannot replace the open file", () => {
    expect(lockedQueryEngineCanStay(1, locked, true)).toBe(true);
  });

  it("does not treat a successful generate as a lock", () => {
    expect(lockedQueryEngineCanStay(0, locked, true)).toBe(false);
  });

  it("still fails when the engine was never written", () => {
    expect(lockedQueryEngineCanStay(1, locked, false)).toBe(false);
  });

  it("still fails when generate failed for another reason", () => {
    expect(
      lockedQueryEngineCanStay(
        1,
        "Environment variable not found: DATABASE_URL",
        true,
      ),
    ).toBe(false);
  });
});
