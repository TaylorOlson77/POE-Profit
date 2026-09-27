import { CreateMapSessionBodySchema } from "@/src/contracts/mapSessions";
import {
  buildMapSessionWriteBody,
  formDetailPath,
  isoToLocalDateTime,
  localDateTimeToIso,
  type MapSessionFormDraft,
} from "./mapSessionForm";

const now = new Date("2026-09-26T16:00:00.000Z");
const storedPriceAt = "2026-09-11T14:30:00.000Z";

function draft(overrides: Partial<MapSessionFormDraft> = {}): MapSessionFormDraft {
  return {
    strategyId: " strat_1 ",
    mapsCompleted: " 40 ",
    mapUnitCostChaos: " 2 ",
    divineRateChaos: " 200 ",
    notes: "  ",
    durationMethod: "EXTRAPOLATED",
    sampleMapsCompleted: " 10 ",
    sampleDurationMinutes: " 20 ",
    startedAtLocal: "",
    endedAtLocal: "",
    manualDurationMinutes: "",
    investmentLines: [
      {
        name: "",
        quantity: "",
        unitValueChaos: "",
        priceRecordedAt: null,
        savedUnitValueChaos: null,
      },
      {
        name: " Gilded Tablet ",
        quantity: " 40 ",
        unitValueChaos: " 7 ",
        priceRecordedAt: null,
        savedUnitValueChaos: null,
      },
    ],
    revenueLines: [
      {
        name: "",
        quantity: "",
        unitValueChaos: "",
        category: "Currency",
        priceRecordedAt: null,
        savedUnitValueChaos: null,
      },
      {
        name: " Divine Orb ",
        quantity: " 1 ",
        unitValueChaos: " 200 ",
        category: " Currency ",
        priceRecordedAt: storedPriceAt,
        savedUnitValueChaos: "200",
      },
    ],
    ...overrides,
  };
}

describe("buildMapSessionWriteBody", () => {
  it("drops blank lines, trims fields, and omits empty notes", () => {
    const { body, submittedInvestmentIndexes, submittedRevenueIndexes, fieldErrors } =
      buildMapSessionWriteBody(draft(), now);

    expect(fieldErrors).toEqual([]);
    expect(submittedInvestmentIndexes).toEqual([1]);
    expect(submittedRevenueIndexes).toEqual([1]);
    expect(body.notes).toBeUndefined();
    expect(body).toMatchObject({
      strategyId: "strat_1",
      mapsCompleted: 40,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      durationMethod: "EXTRAPOLATED",
      sampleMapsCompleted: 10,
      sampleDurationMinutes: "20",
    });
    expect(body.investmentLines).toEqual([
      {
        name: "Gilded Tablet",
        quantity: "40",
        unitValueChaos: "7",
        priceRecordedAt: now.toISOString(),
        priceSource: "MANUAL",
        valuationType: "ACTUAL_PAID",
      },
    ]);
    expect(body.revenueLines[0]).toMatchObject({
      name: "Divine Orb",
      category: "Currency",
      priceRecordedAt: storedPriceAt,
    });
    expect(body).not.toHaveProperty("startedAt");
    expect(body).not.toHaveProperty("manualDurationMinutes");
    expect(CreateMapSessionBodySchema.safeParse(body).success).toBe(true);
  });

  it("keeps a price timestamp when the unit value is unchanged", () => {
    const { body } = buildMapSessionWriteBody(
      draft({
        revenueLines: [
          {
            name: "Divine Orb",
            category: "Currency",
            quantity: "2",
            unitValueChaos: " 200 ",
            priceRecordedAt: storedPriceAt,
            savedUnitValueChaos: "200",
          },
        ],
      }),
      now,
    );

    expect(body.revenueLines[0]?.priceRecordedAt).toBe(storedPriceAt);
  });

  it("restamps a price when the unit value changes", () => {
    const { body } = buildMapSessionWriteBody(
      draft({
        investmentLines: [
          {
            name: "Gilded Tablet",
            quantity: "40",
            unitValueChaos: "8",
            priceRecordedAt: storedPriceAt,
            savedUnitValueChaos: "7",
          },
        ],
      }),
      now,
    );

    expect(body.investmentLines[0]?.priceRecordedAt).toBe(now.toISOString());
  });

  it("sends only observed timestamps for that method", () => {
    const started = "2026-09-14T18:00:00.000Z";
    const ended = "2026-09-14T19:12:00.000Z";
    const { body, fieldErrors } = buildMapSessionWriteBody(
      draft({
        durationMethod: "OBSERVED",
        startedAtLocal: isoToLocalDateTime(started),
        endedAtLocal: isoToLocalDateTime(ended),
        sampleMapsCompleted: "10",
        manualDurationMinutes: "80",
      }),
      now,
    );

    expect(fieldErrors).toEqual([]);
    expect(body).toMatchObject({
      durationMethod: "OBSERVED",
      startedAt: started,
      endedAt: ended,
    });
    expect(body).not.toHaveProperty("sampleMapsCompleted");
    expect(body).not.toHaveProperty("manualDurationMinutes");
    expect(CreateMapSessionBodySchema.safeParse(body).success).toBe(true);
  });

  it("sends only manual minutes for that method", () => {
    const { body } = buildMapSessionWriteBody(
      draft({
        durationMethod: "MANUAL",
        manualDurationMinutes: " 80 ",
        notes: " steady ",
      }),
      now,
    );

    expect(body).toMatchObject({
      durationMethod: "MANUAL",
      manualDurationMinutes: "80",
      notes: "steady",
    });
    expect(body).not.toHaveProperty("sampleDurationMinutes");
    expect(CreateMapSessionBodySchema.safeParse(body).success).toBe(true);
  });

  it("asks for a strategy when none is selected", () => {
    const { fieldErrors } = buildMapSessionWriteBody(
      draft({ strategyId: "  " }),
      now,
    );

    expect(fieldErrors).toContainEqual({
      path: "strategyId",
      message: "Select a strategy",
    });
  });

  it("reports whole-number problems without sending a parsed count", () => {
    const { fieldErrors, body } = buildMapSessionWriteBody(
      draft({ mapsCompleted: "40.5", sampleMapsCompleted: "0" }),
      now,
    );

    expect(fieldErrors).toEqual([
      {
        path: "mapsCompleted",
        message: "Enter a whole number, zero or greater",
      },
      {
        path: "sampleMapsCompleted",
        message: "Enter a whole number greater than zero",
      },
    ]);
    expect(body.mapsCompleted).toBeUndefined();
    expect(CreateMapSessionBodySchema.safeParse(body).success).toBe(false);
  });
});

describe("formDetailPath", () => {
  it("maps submitted line indexes back to form rows", () => {
    expect(formDetailPath("investmentLines.0.quantity", [1], [])).toBe(
      "investmentLines.1.quantity",
    );
    expect(formDetailPath("revenueLines.0.category", [], [1])).toBe(
      "revenueLines.1.category",
    );
    expect(formDetailPath("mapsCompleted", [1], [1])).toBe("mapsCompleted");
  });
});

describe("local datetime conversion", () => {
  it("round-trips an ISO instant through datetime-local", () => {
    const iso = "2026-09-14T18:00:00.000Z";
    expect(localDateTimeToIso(isoToLocalDateTime(iso))).toBe(iso);
  });

  it("rejects empty and unparseable values", () => {
    expect(localDateTimeToIso("")).toBeNull();
    expect(localDateTimeToIso("not-a-date")).toBeNull();
    expect(isoToLocalDateTime("not-a-date")).toBe("");
  });
});
