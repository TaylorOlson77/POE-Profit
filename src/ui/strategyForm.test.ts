import { CreateStrategyBodySchema } from "@/src/contracts/strategies";
import {
  buildStrategyWriteBody,
  gameChangeNeedsConfirm,
  gameChangePrompt,
  formDetailPath,
  type EnhancementLineDraft,
  type StrategyFormDraft,
} from "./strategyForm";

function draft(overrides: Partial<StrategyFormDraft> = {}): StrategyFormDraft {
  return {
    name: " Breach tablets ",
    game: "POE2",
    description: " Tablet farming ",
    mapNotes: "  ",
    mapUnitCostChaos: " 2 ",
    divineRateChaos: "",
    enhancementLines: [
      {
        name: "",
        quantity: "",
        userCostInput: "",
        currency: "CHAOS",
        modifierNotes: "",
        uses: "10",
      },
      {
        name: " Expedition Tablet ",
        quantity: " 2 ",
        userCostInput: " 100 ",
        currency: "CHAOS",
        modifierNotes: " remnants ",
        uses: " 10 ",
      },
    ],
    ...overrides,
  };
}

describe("buildStrategyWriteBody", () => {
  it("drops a tablet row that has only the default uses", () => {
    const { body, submittedLineIndexes } = buildStrategyWriteBody(draft());

    expect(submittedLineIndexes).toEqual([1]);
    expect(body.mapNotes).toBeUndefined();
    expect(body).toMatchObject({
      name: "Breach tablets",
      description: "Tablet farming",
      mapUnitCostChaos: "2",
      divineRateChaos: null,
      enhancementLines: [
        {
          name: "Expedition Tablet",
          quantity: "2",
          userCostInput: "100",
          currency: "CHAOS",
          modifierNotes: "remnants",
          uses: 10,
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
            userCostInput: "10",
            currency: "CHAOS",
            modifierNotes: "should not be sent",
            uses: "10",
          },
        ],
      }),
    );

    expect(body.mapNotes).toBe("t16");
    expect(body.enhancementLines[0]).toEqual({
      name: "Scarab of Lineage",
      quantity: "1",
      userCostInput: "10",
      currency: "CHAOS",
      uses: 1,
      sortOrder: 0,
    });
    expect(CreateStrategyBodySchema.safeParse(body).success).toBe(true);
  });

  it("saves a PoE1 line at 1 use", () => {
    const { body } = buildStrategyWriteBody(
      draft({
        game: "POE1",
        enhancementLines: [
          {
            name: "Scarab of Lineage",
            quantity: "1",
            userCostInput: "100",
            currency: "CHAOS",
            modifierNotes: "",
            uses: "10",
          },
        ],
      }),
    );

    expect(body.enhancementLines[0]?.uses).toBe(1);
    expect(CreateStrategyBodySchema.safeParse(body).success).toBe(true);
  });

  it("submits a use count of 0, a blank use count, and a fractional use count", () => {
    for (const uses of ["0", "", "1.5"]) {
      const { body } = buildStrategyWriteBody(
        draft({
          enhancementLines: [
            {
              name: "Expedition Tablet",
              quantity: "1",
              userCostInput: "100",
              currency: "CHAOS",
              modifierNotes: "",
              uses,
            },
          ],
        }),
      );
      const parsed = CreateStrategyBodySchema.safeParse(body);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(
          parsed.error.issues.some(
            (issue) =>
              issue.message === "Uses must be a whole number of at least 1",
          ),
        ).toBe(true);
      }
    }
  });

  it("keeps a tablet row whose uses are not the default", () => {
    const { body, submittedLineIndexes } = buildStrategyWriteBody(
      draft({
        enhancementLines: [
          {
            name: "",
            quantity: "",
            userCostInput: "",
            currency: "CHAOS",
            modifierNotes: "",
            uses: "5",
          },
        ],
      }),
    );

    expect(submittedLineIndexes).toEqual([0]);
    expect(body.enhancementLines[0]?.uses).toBe(5);
  });
});

function contentLine(
  overrides: Partial<EnhancementLineDraft> = {},
): EnhancementLineDraft {
  return {
    name: "",
    quantity: "",
    userCostInput: "",
    currency: "CHAOS",
    modifierNotes: "",
    uses: "10",
    ...overrides,
  };
}

describe("gameChangeNeedsConfirm", () => {
  it("changes game without asking when no row has a name, a quantity, or a unit cost", () => {
    expect(gameChangeNeedsConfirm([])).toBe(false);
    expect(gameChangeNeedsConfirm([contentLine()])).toBe(false);
    expect(gameChangeNeedsConfirm([contentLine({ uses: "5" })])).toBe(false);
    expect(
      gameChangeNeedsConfirm([contentLine({ modifierNotes: " remnants " })]),
    ).toBe(false);
    expect(gameChangeNeedsConfirm([contentLine({ currency: "DIVINE" })])).toBe(
      false,
    );
    for (const field of ["name", "quantity", "userCostInput"] as const) {
      expect(gameChangeNeedsConfirm([contentLine({ [field]: "  " })])).toBe(
        false,
      );
    }
  });

  it("asks when a row has a name, a quantity, or a unit cost", () => {
    expect(gameChangeNeedsConfirm([contentLine({ name: " Expedition " })])).toBe(
      true,
    );
    expect(gameChangeNeedsConfirm([contentLine({ quantity: "1" })])).toBe(true);
    expect(
      gameChangeNeedsConfirm([contentLine({ userCostInput: "100" })]),
    ).toBe(true);
  });
});

describe("gameChangePrompt", () => {
  it("names tablets when leaving Path of Exile 2", () => {
    expect(gameChangePrompt("POE2")).toBe(
      "Switch games and clear the tablets?",
    );
  });

  it("names scarabs when leaving Path of Exile 1", () => {
    expect(gameChangePrompt("POE1")).toBe(
      "Switch games and clear the scarabs?",
    );
  });
});

describe("formDetailPath", () => {
  it("maps a submitted line index back to the form row", () => {
    expect(formDetailPath("enhancementLines.0.quantity", [1])).toBe(
      "enhancementLines.1.quantity",
    );
    expect(formDetailPath("enhancementLines.0.userCostInput", [1])).toBe(
      "enhancementLines.1.userCostInput",
    );
    expect(formDetailPath("name", [1])).toBe("name");
  });
});
