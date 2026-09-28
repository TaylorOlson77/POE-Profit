import { ApiErrorBodySchema } from "@/src/contracts/errors";
import {
  StrategyListResponseSchema,
  StrategyResponseSchema,
} from "@/src/contracts/strategies";
import { DELETE, GET as getOne, PUT } from "@/app/api/strategies/[id]/route";
import { GET as list, POST } from "@/app/api/strategies/route";
import {
  failNextDelete,
  failNextList,
  resetStrategyDb,
  setSessionCount,
} from "./strategyDbMock";

jest.mock("@/src/server/db/prisma", () => ({
  prisma: jest.requireActual<typeof import("./strategyDbMock")>("./strategyDbMock")
    .fakePrisma,
}));

const expedition = {
  name: "Expedition Tablet Farming",
  game: "POE2",
  description: "Tablet-focused expedition farming",
  mapNotes: "T16 waystones",
  mapUnitCostChaos: "2",
  enhancementLines: [
    { name: "Expedition Tablet", quantity: "2", unitCostChaos: "100" },
    {
      name: "Temple Tablet",
      modifierNotes: "remnants",
      quantity: "1",
      unitCostChaos: "10",
    },
  ],
};

function post(body: unknown, raw?: string) {
  return POST(
    new Request("http://localhost/api/strategies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: raw ?? JSON.stringify(body),
    }),
  );
}

function idContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  resetStrategyDb();
});

describe("POST /api/strategies", () => {
  it("persists engine line totals and per-map cost as decimal strings", async () => {
    const response = await post(expedition);

    expect(response.status).toBe(201);
    const body: unknown = await response.json();
    const strategy = StrategyResponseSchema.parse(body);

    expect(strategy.enhancementLines.map((line) => line.lineTotalChaos)).toEqual([
      "200",
      "10",
    ]);
    expect(strategy.enhancementLines.map((line) => line.sortOrder)).toEqual([0, 1]);
    expect(strategy.estimatedCostPerMapChaos).toBe("212");
    expect(strategy.mapUnitCostChaos).toBe("2");
    expect(typeof strategy.estimatedCostPerMapChaos).toBe("string");
  });

  it("does not display-round a total the engine keeps past two places", async () => {
    const response = await post({
      name: "Fraction",
      game: "POE2",
      description: "Unrounded line",
      mapUnitCostChaos: "0",
      enhancementLines: [
        { name: "Dust", quantity: "1", unitCostChaos: "1.005" },
      ],
    });

    expect(response.status).toBe(201);
    const strategy = StrategyResponseSchema.parse(await response.json());
    expect(strategy.enhancementLines[0]?.lineTotalChaos).toBe("1.005");
    expect(strategy.estimatedCostPerMapChaos).toBe("1.005");
  });

  it("returns 400 VALIDATION_ERROR for a missing name, a bad decimal, and too many lines", async () => {
    const missingName = await post({
      game: "POE2",
      description: "No name",
      mapUnitCostChaos: "2",
    });
    expect(missingName.status).toBe(400);
    const missingBody = ApiErrorBodySchema.parse(await missingName.json());
    expect(missingBody.error.code).toBe("VALIDATION_ERROR");
    expect(missingBody.error.details.some((detail) => detail.path === "name")).toBe(
      true,
    );

    const badDecimal = await post({
      ...expedition,
      mapUnitCostChaos: "-1",
    });
    expect(badDecimal.status).toBe(400);
    const decimalBody = ApiErrorBodySchema.parse(await badDecimal.json());
    expect(decimalBody.error.code).toBe("VALIDATION_ERROR");
    expect(
      decimalBody.error.details.some((detail) => detail.path === "mapUnitCostChaos"),
    ).toBe(true);

    const tooMany = await post({
      name: "Too many",
      game: "POE2",
      description: "Cap",
      mapUnitCostChaos: "1",
      enhancementLines: Array.from({ length: 26 }, (_, index) => ({
        name: `Line ${index}`,
        quantity: "1",
        unitCostChaos: "1",
      })),
    });
    expect(tooMany.status).toBe(400);
    const tooManyBody = ApiErrorBodySchema.parse(await tooMany.json());
    expect(tooManyBody.error.details.some((detail) => detail.path === "enhancementLines")).toBe(
      true,
    );
  });

  it("rejects a calculated cost that does not fit the money column", async () => {
    const response = await post({
      name: "Overflow",
      game: "POE2",
      description: "Product does not fit",
      mapUnitCostChaos: "0",
      enhancementLines: [
        { name: "Tablet", quantity: "999999999999", unitCostChaos: "2" },
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

    const listed = StrategyListResponseSchema.parse(await (await list()).json());
    expect(listed.strategies).toEqual([]);
  });

  it("returns 400 when the body is not JSON", async () => {
    const response = await post(undefined, "{");
    expect(response.status).toBe(400);
    const body = ApiErrorBodySchema.parse(await response.json());
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toEqual([{ path: "", message: "Invalid JSON" }]);
  });
});

describe("GET /api/strategies", () => {
  it("lists newest strategies first", async () => {
    const first = StrategyResponseSchema.parse(await (await post({
      name: "First",
      game: "POE2",
      description: "Older",
      mapUnitCostChaos: "1",
    })).json());
    const second = StrategyResponseSchema.parse(await (await post({
      name: "Second",
      game: "POE1",
      description: "Newer",
      mapUnitCostChaos: "3",
    })).json());

    const response = await list();
    expect(response.status).toBe(200);
    const body = StrategyListResponseSchema.parse(await response.json());
    expect(body.strategies.map((strategy) => strategy.id)).toEqual([
      second.id,
      first.id,
    ]);
    expect(body.strategies[1]?.mapNotes).toBeUndefined();
  });

  it("returns 500 INTERNAL_ERROR without the database message", async () => {
    failNextList();
    const response = await list();
    expect(response.status).toBe(500);
    const body = ApiErrorBodySchema.parse(await response.json());
    expect(body.error).toEqual({
      code: "INTERNAL_ERROR",
      message: "Unexpected error",
      details: [],
    });
  });
});

describe("/api/strategies/:id", () => {
  it("gets a strategy and returns 404 for an unknown id", async () => {
    const created = StrategyResponseSchema.parse(await (await post(expedition)).json());

    const found = await getOne(new Request("http://localhost"), idContext(created.id));
    expect(found.status).toBe(200);
    expect(StrategyResponseSchema.parse(await found.json()).id).toBe(created.id);

    const missing = await getOne(new Request("http://localhost"), idContext("missing"));
    expect(missing.status).toBe(404);
    expect(ApiErrorBodySchema.parse(await missing.json()).error.code).toBe("NOT_FOUND");
  });

  it("replaces lines and recalculates both persisted totals", async () => {
    const created = StrategyResponseSchema.parse(await (await post(expedition)).json());

    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Reworked",
          game: "POE2",
          description: "One tablet",
          mapUnitCostChaos: "3",
          enhancementLines: [
            { name: "Cheap Tablet", quantity: "1", unitCostChaos: "5" },
          ],
        }),
      }),
      idContext(created.id),
    );

    expect(response.status).toBe(200);
    const updated = StrategyResponseSchema.parse(await response.json());
    expect(updated.enhancementLines).toHaveLength(1);
    expect(updated.enhancementLines[0]?.lineTotalChaos).toBe("5");
    expect(updated.estimatedCostPerMapChaos).toBe("8");
    expect(updated.mapNotes).toBeUndefined();

    const missing = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Nope",
          game: "POE2",
          description: "Missing",
          mapUnitCostChaos: "1",
        }),
      }),
      idContext("missing"),
    );
    expect(missing.status).toBe(404);
    expect(ApiErrorBodySchema.parse(await missing.json()).error.code).toBe("NOT_FOUND");
  });

  it("deletes a strategy with no sessions and returns an empty 204", async () => {
    const created = StrategyResponseSchema.parse(await (await post(expedition)).json());

    const response = await DELETE(new Request("http://localhost"), idContext(created.id));
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");

    const missing = await getOne(new Request("http://localhost"), idContext(created.id));
    expect(missing.status).toBe(404);
  });

  it("returns 409 CONFLICT when map sessions still reference the strategy", async () => {
    const created = StrategyResponseSchema.parse(await (await post(expedition)).json());
    setSessionCount(created.id, 1);

    const response = await DELETE(new Request("http://localhost"), idContext(created.id));
    expect(response.status).toBe(409);
    const body = ApiErrorBodySchema.parse(await response.json());
    expect(body.error.code).toBe("CONFLICT");
    expect(body.error.message).toMatch(/map sessions/);
    expect(body.error.details).toEqual([]);

    const stillThere = await getOne(new Request("http://localhost"), idContext(created.id));
    expect(stillThere.status).toBe(200);
  });

  it("maps a restrict error from the database to the same 409", async () => {
    const created = StrategyResponseSchema.parse(await (await post(expedition)).json());
    failNextDelete("P2003");

    const response = await DELETE(new Request("http://localhost"), idContext(created.id));
    expect(response.status).toBe(409);
    expect(ApiErrorBodySchema.parse(await response.json()).error.code).toBe("CONFLICT");

    const stillThere = await getOne(new Request("http://localhost"), idContext(created.id));
    expect(stillThere.status).toBe(200);
  });

  it("returns 404 when deleting an unknown id", async () => {
    const response = await DELETE(new Request("http://localhost"), idContext("missing"));
    expect(response.status).toBe(404);
    expect(ApiErrorBodySchema.parse(await response.json()).error.code).toBe("NOT_FOUND");
  });
});
