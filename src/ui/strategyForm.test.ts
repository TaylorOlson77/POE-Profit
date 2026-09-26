import { CreateStrategyBodySchema } from "@/src/contracts/strategies";
import {
  buildStrategyWriteBody,
  formDetailPath,
  type StrategyFormDraft,
} from "./strategyForm";

function draft(overrides: Partial<StrategyFormDraft> = {}): StrategyFormDraft {
  return {
    name: " Breach tablets ",
    game: "POE2",
    description: " Tablet farming ",
    mapNotes: "  ",
    mapUnitCostChaos: " 2 ",
    enhancementLines: [
      {
        name: "",
        quantity: "",
        unitCostChaos: "",
        modifierNotes: "",
      },
      {
        name: " Expedition Tablet ",
        quantity: " 2 ",
        unitCostChaos: " 100 ",
        modifierNotes: " remnants ",
      },
    ],
    ...overrides,
  };
}

describe("buildStrategyWriteBody", () => {
  it("drops blank lines, trims fields, and omits empty map notes", () => {
    const { body, submittedLineIndexes } = buildStrategyWriteBody(draft());

    expect(submittedLineIndexes).toEqual([1]);
    expect(body.mapNotes).toBeUndefined();
    expect(body).toMatchObject({
      name: "Breach tablets",
      description: "Tablet farming",
      mapUnitCostChaos: "2",
      enhancementLines: [
        {
          name: "Expedition Tablet",
          quantity: "2",
          unitCostChaos: "100",
          modifierNotes: "remnants",
          sortOrder: 0,
        },
      ],
    });
    expect(CreateStrategyBodySchema.safeParse(body).success).toBe(true);
  });

  it("omits modifier notes when the strategy is PoE1", () => {
    const { body } = buildStrategyWriteBody(
      draft({
        game: "POE1",
        mapNotes: " t16 ",
        enhancementLines: [
          {
            name: "Scarab of Lineage",
            quantity: "1",
            unitCostChaos: "10",
            modifierNotes: "should not be sent",
          },
        ],
      }),
    );

    expect(body.mapNotes).toBe("t16");
    expect(body.enhancementLines[0]).toEqual({
      name: "Scarab of Lineage",
      quantity: "1",
      unitCostChaos: "10",
      sortOrder: 0,
    });
    expect(CreateStrategyBodySchema.safeParse(body).success).toBe(true);
  });
});

describe("formDetailPath", () => {
  it("maps a submitted line index back to the form row", () => {
    expect(formDetailPath("enhancementLines.0.quantity", [1])).toBe(
      "enhancementLines.1.quantity",
    );
    expect(formDetailPath("name", [1])).toBe("name");
  });
});
