import {
  CreateMapSessionBodySchema,
  CreateStrategyBodySchema,
  MAX_NAME_LENGTH,
  MAX_NOTES_LENGTH,
} from "./index";

const strategyBody = {
  name: "Expedition",
  game: "POE2" as const,
  description: "Tablets",
  mapUnitCostChaos: "2",
};

const sessionBody = {
  strategyId: "strat_1",
  mapsCompleted: 1,
  mapUnitCostChaos: "2",
  divineRateChaos: "200",
  durationMethod: "EXTRAPOLATED" as const,
  sampleMapsCompleted: 1,
  sampleDurationMinutes: "1",
};

describe("text length caps", () => {
  it("rejects a name or note past its length cap", () => {
    expect(
      CreateStrategyBodySchema.safeParse({
        ...strategyBody,
        name: "a".repeat(MAX_NAME_LENGTH + 1),
      }).success,
    ).toBe(false);
    expect(
      CreateStrategyBodySchema.safeParse({
        ...strategyBody,
        name: "a".repeat(MAX_NAME_LENGTH),
      }).success,
    ).toBe(true);

    expect(
      CreateMapSessionBodySchema.safeParse({
        ...sessionBody,
        notes: "a".repeat(MAX_NOTES_LENGTH + 1),
      }).success,
    ).toBe(false);
    expect(
      CreateMapSessionBodySchema.safeParse({
        ...sessionBody,
        notes: "a".repeat(MAX_NOTES_LENGTH),
      }).success,
    ).toBe(true);
  });
});
