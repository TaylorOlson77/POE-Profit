import { ApiErrorBodySchema } from "@/src/contracts/errors";
import {
  MapSessionListResponseSchema,
  MapSessionSchema,
} from "@/src/contracts/mapSessions";
import { DELETE, GET as getOne, PUT } from "@/app/api/map-sessions/[id]/route";
import { GET as list, POST } from "@/app/api/map-sessions/route";
import { resetMapSessionDb, seedStrategy } from "./mapSessionDbMock";

jest.mock("@/src/server/db/prisma", () => ({
  prisma: jest.requireActual<typeof import("./mapSessionDbMock")>(
    "./mapSessionDbMock",
  ).fakePrisma,
}));

const PRICED_AT = "2026-01-01T00:00:00.000Z";
const STRATEGY_ID = "strat_1";

const expedition = {
  strategyId: STRATEGY_ID,
  mapsCompleted: 40,
  mapUnitCostChaos: "2",
  divineRateChaos: "200",
  notes: "Seed-shaped session",
  durationMethod: "EXTRAPOLATED",
  sampleMapsCompleted: 10,
  sampleDurationMinutes: "20",
  investmentLines: [
    {
      name: "Expedition Tablet",
      quantity: "40",
      unitValueChaos: "7",
      priceRecordedAt: PRICED_AT,
    },
    {
      name: "Temple Tablet",
      quantity: "40",
      unitValueChaos: "1",
      priceRecordedAt: PRICED_AT,
    },
  ],
  revenueLines: [
    {
      name: "Divine Orb",
      category: "Currency",
      quantity: "8",
      unitValueChaos: "200",
      priceRecordedAt: PRICED_AT,
    },
    {
      name: "Exalted Orb",
      category: "Currency",
      quantity: "30",
      unitValueChaos: "14",
      priceRecordedAt: PRICED_AT,
    },
    {
      name: "Expedition Tablet",
      category: "Tablets",
      quantity: "60",
      unitValueChaos: "5",
      priceRecordedAt: PRICED_AT,
    },
  ],
};

function post(body: unknown, raw?: string) {
  return POST(
    new Request("http://localhost/api/map-sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: raw ?? JSON.stringify(body),
    }),
  );
}

function put(id: string, body: unknown) {
  return PUT(
    new Request("http://localhost/api/map-sessions/" + id, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
}

function idContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  resetMapSessionDb();
  seedStrategy(STRATEGY_ID);
});

describe("POST /api/map-sessions", () => {
  it("persists the seed snapshot from the calc engine as decimal strings", async () => {
    const response = await post(expedition);

    expect(response.status).toBe(201);
    const session = MapSessionSchema.parse(await response.json());

    expect(session.investmentLines.map((line) => line.lineTotalChaos)).toEqual([
      "280",
      "40",
    ]);
    expect(session.revenueLines.map((line) => line.lineTotalChaos)).toEqual([
      "1600",
      "420",
      "300",
    ]);
    expect(session.investmentLines[0]?.priceSource).toBe("MANUAL");
    expect(session.investmentLines[0]?.priceRecordedAt).toBe(PRICED_AT);
    expect(session.revenueLines[0]?.valuationType).toBe("ACTUAL_PAID");
    expect(session.revenueLines[0]?.priceRecordedAt).toBe(PRICED_AT);
    expect(session.mapInvestmentChaos).toBe("80");
    expect(session.totalInvestmentChaos).toBe("400");
    expect(session.totalRevenueChaos).toBe("2320");
    expect(session.profitChaos).toBe("1920");
    expect(session.effectiveDurationMinutes).toBe("80");
    expect(session.durationMethodLabel).toBe("Extrapolated");
    expect(session.profitPerHourChaos).toBe("1440");
    expect(session.profitPerMapChaos).toBe("48");
    expect(session.mapsPerHour).toBe("30");
    expect(session.roiPercent).toBe("480");
    expect(session.profitDivineApprox).toBe("9.6");
    expect(typeof session.profitChaos).toBe("string");
  });

  it("ignores client-supplied calculated fields", async () => {
    const response = await post({
      ...expedition,
      profitChaos: "1",
      durationMethodLabel: "Manual",
      investmentLines: expedition.investmentLines.map((line) => ({
        ...line,
        lineTotalChaos: "999",
      })),
    });

    expect(response.status).toBe(201);
    const session = MapSessionSchema.parse(await response.json());
    expect(session.profitChaos).toBe("1920");
    expect(session.durationMethodLabel).toBe("Extrapolated");
    expect(session.investmentLines[0]?.lineTotalChaos).toBe("280");
  });

  it("returns null profitDivineApprox when the divine rate is not positive", async () => {
    const response = await post({
      strategyId: STRATEGY_ID,
      mapsCompleted: 1,
      mapUnitCostChaos: "0",
      divineRateChaos: "0",
      durationMethod: "MANUAL",
      manualDurationMinutes: "60",
    });

    expect(response.status).toBe(201);
    const session = MapSessionSchema.parse(await response.json());
    expect(session.profitChaos).toBe("0");
    expect(session.profitDivineApprox).toBeNull();
  });

  it("returns null rate metrics when manual duration is zero", async () => {
    const response = await post({
      strategyId: STRATEGY_ID,
      mapsCompleted: 1,
      mapUnitCostChaos: "10",
      divineRateChaos: "200",
      durationMethod: "MANUAL",
      manualDurationMinutes: "0",
    });

    expect(response.status).toBe(201);
    const session = MapSessionSchema.parse(await response.json());
    expect(session.effectiveDurationMinutes).toBe("0");
    expect(session.profitPerHourChaos).toBeNull();
    expect(session.mapsPerHour).toBeNull();
    expect(session.profitChaos).toBe("-10");
  });

  it("counts map spend when investment and revenue lines are empty", async () => {
    const response = await post({
      strategyId: STRATEGY_ID,
      mapsCompleted: 40,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      durationMethod: "EXTRAPOLATED",
      sampleMapsCompleted: 10,
      sampleDurationMinutes: "20",
    });

    expect(response.status).toBe(201);
    const session = MapSessionSchema.parse(await response.json());
    expect(session.investmentLines).toEqual([]);
    expect(session.revenueLines).toEqual([]);
    expect(session.mapInvestmentChaos).toBe("80");
    expect(session.totalInvestmentChaos).toBe("80");
    expect(session.totalRevenueChaos).toBe("0");
    expect(session.profitChaos).toBe("-80");
    expect(session.notes).toBeUndefined();
  });

  it("returns 400 for an inverted observed window, a zero sample, and a bad decimal", async () => {
    const inverted = await post({
      strategyId: STRATEGY_ID,
      mapsCompleted: 1,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      durationMethod: "OBSERVED",
      startedAt: "2026-01-01T01:00:00.000Z",
      endedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(inverted.status).toBe(400);
    const invertedBody = ApiErrorBodySchema.parse(await inverted.json());
    expect(invertedBody.error.code).toBe("VALIDATION_ERROR");
    expect(invertedBody.error.details.some((detail) => detail.path === "endedAt")).toBe(
      true,
    );

    const zeroSample = await post({
      strategyId: STRATEGY_ID,
      mapsCompleted: 1,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      durationMethod: "EXTRAPOLATED",
      sampleMapsCompleted: 0,
      sampleDurationMinutes: "20",
    });
    expect(zeroSample.status).toBe(400);
    const sampleBody = ApiErrorBodySchema.parse(await zeroSample.json());
    expect(
      sampleBody.error.details.some((detail) => detail.path === "sampleMapsCompleted"),
    ).toBe(true);

    const badDecimal = await post({
      ...expedition,
      investmentLines: [
        {
          name: "Dust",
          quantity: "1",
          unitValueChaos: "-1",
          priceRecordedAt: PRICED_AT,
        },
      ],
    });
    expect(badDecimal.status).toBe(400);
    const decimalBody = ApiErrorBodySchema.parse(await badDecimal.json());
    expect(
      decimalBody.error.details.some(
        (detail) => detail.path === "investmentLines.0.unitValueChaos",
      ),
    ).toBe(true);
  });

  it("rejects a calculated total that does not fit the money column", async () => {
    const response = await post({
      strategyId: STRATEGY_ID,
      mapsCompleted: 1,
      mapUnitCostChaos: "0",
      divineRateChaos: "1",
      durationMethod: "MANUAL",
      manualDurationMinutes: "1",
      investmentLines: [
        {
          name: "Tablet",
          quantity: "999999999999",
          unitValueChaos: "2",
          priceRecordedAt: PRICED_AT,
        },
      ],
    });

    expect(response.status).toBe(400);
    const body = ApiErrorBodySchema.parse(await response.json());
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toEqual([
      {
        path: "",
        message: "Calculated total does not fit the money column",
      },
    ]);

    const listed = MapSessionListResponseSchema.parse(await (await list()).json());
    expect(listed.mapSessions).toEqual([]);
  });

  it("returns 400 when the body is not JSON", async () => {
    const response = await post(undefined, "{");
    expect(response.status).toBe(400);
    const body = ApiErrorBodySchema.parse(await response.json());
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toEqual([{ path: "", message: "Invalid JSON" }]);
  });

  it("returns 404 when the strategy does not exist", async () => {
    const response = await post({ ...expedition, strategyId: "missing" });
    expect(response.status).toBe(404);
    const body = ApiErrorBodySchema.parse(await response.json());
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toBe("Strategy not found");
  });
});

describe("GET /api/map-sessions", () => {
  it("lists newest sessions first", async () => {
    const first = MapSessionSchema.parse(await (await post(expedition)).json());
    const second = MapSessionSchema.parse(
      await (
        await post({
          strategyId: STRATEGY_ID,
          mapsCompleted: 1,
          mapUnitCostChaos: "1",
          divineRateChaos: "200",
          durationMethod: "MANUAL",
          manualDurationMinutes: "10",
        })
      ).json(),
    );

    const response = await list();
    expect(response.status).toBe(200);
    const body = MapSessionListResponseSchema.parse(await response.json());
    expect(body.mapSessions.map((session) => session.id)).toEqual([
      second.id,
      first.id,
    ]);
  });
});

describe("/api/map-sessions/:id", () => {
  it("gets a session and returns 404 for an unknown id", async () => {
    const created = MapSessionSchema.parse(await (await post(expedition)).json());

    const found = await getOne(new Request("http://localhost"), idContext(created.id));
    expect(found.status).toBe(200);
    expect(MapSessionSchema.parse(await found.json()).id).toBe(created.id);

    const missing = await getOne(new Request("http://localhost"), idContext("missing"));
    expect(missing.status).toBe(404);
    expect(ApiErrorBodySchema.parse(await missing.json()).error.code).toBe("NOT_FOUND");
  });

  it("recalculates on replace and keeps only the active duration branch", async () => {
    const created = MapSessionSchema.parse(await (await post(expedition)).json());

    const replaced = await put(created.id, {
      strategyId: STRATEGY_ID,
      mapsCompleted: 20,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      durationMethod: "EXTRAPOLATED",
      sampleMapsCompleted: 10,
      sampleDurationMinutes: "20",
    });
    expect(replaced.status).toBe(200);
    const halved = MapSessionSchema.parse(await replaced.json());
    expect(halved.investmentLines).toEqual([]);
    expect(halved.mapInvestmentChaos).toBe("40");
    expect(halved.profitChaos).toBe("-40");
    expect(halved.effectiveDurationMinutes).toBe("40");
    expect(halved.profitPerHourChaos).toBe("-60");
    expect(halved.id).toBe(created.id);

    const switched = await put(created.id, {
      strategyId: STRATEGY_ID,
      mapsCompleted: 20,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      durationMethod: "MANUAL",
      manualDurationMinutes: "0",
    });
    expect(switched.status).toBe(200);
    const raw: unknown = await switched.json();
    expect(raw).toEqual(
      expect.objectContaining({
        durationMethod: "MANUAL",
        manualDurationMinutes: "0",
        durationMethodLabel: "Manual",
        effectiveDurationMinutes: "0",
        profitPerHourChaos: null,
        mapsPerHour: null,
      }),
    );
    expect(raw).not.toHaveProperty("sampleMapsCompleted");
    expect(raw).not.toHaveProperty("sampleDurationMinutes");
    expect(raw).not.toHaveProperty("startedAt");
    const manual = MapSessionSchema.parse(raw);
    expect(manual.durationMethod).toBe("MANUAL");
  });

  it("returns 404 for an unknown session id and an unknown strategy", async () => {
    const created = MapSessionSchema.parse(await (await post(expedition)).json());

    const missingSession = await put("missing", {
      ...expedition,
      mapsCompleted: 1,
    });
    expect(missingSession.status).toBe(404);
    expect(ApiErrorBodySchema.parse(await missingSession.json()).error.message).toBe(
      "Map session not found",
    );

    const missingStrategy = await put(created.id, {
      ...expedition,
      strategyId: "missing",
    });
    expect(missingStrategy.status).toBe(404);
    expect(ApiErrorBodySchema.parse(await missingStrategy.json()).error.message).toBe(
      "Strategy not found",
    );

    const unchanged = await getOne(new Request("http://localhost"), idContext(created.id));
    expect(MapSessionSchema.parse(await unchanged.json()).profitChaos).toBe("1920");
  });

  it("deletes a session with an empty 204 and returns 404 after that", async () => {
    const created = MapSessionSchema.parse(await (await post(expedition)).json());

    const response = await DELETE(new Request("http://localhost"), idContext(created.id));
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");

    const missing = await getOne(new Request("http://localhost"), idContext(created.id));
    expect(missing.status).toBe(404);

    const again = await DELETE(new Request("http://localhost"), idContext(created.id));
    expect(again.status).toBe(404);
    expect(ApiErrorBodySchema.parse(await again.json()).error.code).toBe("NOT_FOUND");
  });
});
