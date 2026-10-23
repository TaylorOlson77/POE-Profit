import { randomUUID } from "node:crypto";

import Decimal from "decimal.js";

import {
  DELETE as deleteSession,
  GET as getSession,
  PUT as putSession,
} from "@/app/api/map-sessions/[id]/route";
import { POST as postSession } from "@/app/api/map-sessions/route";
import {
  DELETE as deleteStrategy,
  GET as getStrategy,
} from "@/app/api/strategies/[id]/route";
import { POST as postStrategy } from "@/app/api/strategies/route";
import { MapSessionSchema } from "@/src/contracts/mapSessions";
import { StrategySchema } from "@/src/contracts/strategies";
import { isForeignKeyRestrictError } from "@/src/server/apiError";
import { prisma } from "@/src/server/db/prisma";

/**
 * Persistence round-trips on the real Prisma client.
 *
 * Each test creates an `api-db-` strategy and deletes it in `finally`.
 * Do not read or delete the demo strategy, the seed session, or call reset-to-seed.
 * Locally this is the Neon `local` branch. CI injects the `ci` branch.
 */

const PRICED_AT = "2026-01-01T00:00:00.000Z";
const DISTINCT_PRICED_AT = "2024-06-15T18:30:45.123Z";

afterAll(async () => {
  await prisma.$disconnect();
});

function idContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function strategyName(label: string): string {
  return `api-db-${label}-${randomUUID()}`;
}

function expectStatus(
  result: { status: number; json: unknown },
  status: number,
): void {
  if (result.status !== status) {
    throw new Error(
      `expected ${status}, got ${result.status}: ${JSON.stringify(result.json)}`,
    );
  }
}

async function readBody(
  response: Response,
): Promise<{ status: number; json: unknown }> {
  const text = await response.text();
  if (!text) {
    return { status: response.status, json: null };
  }
  try {
    return { status: response.status, json: JSON.parse(text) as unknown };
  } catch {
    return { status: response.status, json: text };
  }
}

async function createStrategy(label: string): Promise<string> {
  const response = await postStrategy(
    new Request("http://localhost/api/strategies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: strategyName(label),
        game: "POE2",
        description: "API persistence",
        mapUnitCostChaos: "0",
        divineRateChaos: null,
        enhancementLines: [],
      }),
    }),
  );
  const result = await readBody(response);
  expectStatus(result, 201);
  return StrategySchema.parse(result.json).id;
}

function sessionBody(
  strategyId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    strategyId,
    mapsCompleted: 1,
    mapUnitCostChaos: "0",
    divineRateChaos: "1",
    durationMethod: "MANUAL",
    manualDurationMinutes: "60",
    investmentLines: [],
    revenueLines: [],
    ...overrides,
  };
}

function investmentLine(
  name: string,
  quantity: string,
  unitValueChaos: string,
  priceRecordedAt = PRICED_AT,
) {
  return { name, quantity, unitValueChaos, priceRecordedAt };
}

async function postOwnedSession(body: unknown) {
  return postSession(
    new Request("http://localhost/api/map-sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

async function fetchSession(id: string) {
  const result = await readBody(
    await getSession(
      new Request("http://localhost/api/map-sessions/" + id),
      idContext(id),
    ),
  );
  expectStatus(result, 200);
  return MapSessionSchema.parse(result.json);
}

async function removeOwned(
  strategyId: string,
  sessionId: string | null,
): Promise<void> {
  if (sessionId) {
    await deleteSession(
      new Request("http://localhost/api/map-sessions/" + sessionId, {
        method: "DELETE",
      }),
      idContext(sessionId),
    );
  }
  const removed = await deleteStrategy(
    new Request("http://localhost/api/strategies/" + strategyId, {
      method: "DELETE",
    }),
    idContext(strategyId),
  );
  if (removed.status !== 204 && removed.status !== 404) {
    const text = await removed.text();
    throw new Error(`left strategy ${strategyId} (${removed.status}) ${text}`);
  }
}

describe("API persistence", () => {
  it("stores a divine tablet's typed cost and its chaos unit cost", async () => {
    const response = await postStrategy(
      new Request("http://localhost/api/strategies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: strategyName("divine-tablet"),
          game: "POE2",
          description: "API persistence",
          mapUnitCostChaos: "2",
          divineRateChaos: "200",
          enhancementLines: [
            {
              name: "Expedition Tablet",
              quantity: "1",
              userCostInput: "10",
              currency: "DIVINE",
              uses: 10,
            },
          ],
        }),
      }),
    );
    const created = await readBody(response);
    expectStatus(created, 201);
    const strategyId = StrategySchema.parse(created.json).id;
    try {
      const loaded = await readBody(
        await getStrategy(
          new Request("http://localhost/api/strategies/" + strategyId),
          idContext(strategyId),
        ),
      );
      expectStatus(loaded, 200);
      const stored = StrategySchema.parse(loaded.json);
      expect(stored.divineRateChaos).toBe("200");
      expect(stored.estimatedCostPerMapChaos).toBe("202");
      expect(stored.enhancementLines[0]).toMatchObject({
        userCostInput: "10",
        currency: "DIVINE",
        unitCostChaos: "2000",
        lineTotalChaos: "200",
      });
    } finally {
      await removeOwned(strategyId, null);
    }
  });

  it("stores an 8-decimal-place line that still multiplies", async () => {
    const strategyId = await createStrategy("eight-decimal");
    let sessionId: string | null = null;
    try {
      const created = await readBody(
        await postOwnedSession(
          sessionBody(strategyId, {
            investmentLines: [
              investmentLine("Scale line", "1.00000001", "2.00000000"),
            ],
          }),
        ),
      );
      expectStatus(created, 201);
      sessionId = MapSessionSchema.parse(created.json).id;

      const session = await fetchSession(sessionId);
      const line = session.investmentLines[0];
      expect(line?.quantity).toBe("1.00000001");
      expect(line?.unitValueChaos).toBe("2");
      expect(line?.lineTotalChaos).toBe("2.00000002");
      expect(
        new Decimal(line?.quantity ?? "0")
          .times(line?.unitValueChaos ?? "0")
          .eq(line?.lineTotalChaos ?? "0"),
      ).toBe(true);
    } finally {
      await removeOwned(strategyId, sessionId);
    }
  });

  it("round-trips a money amount at the column limit", async () => {
    const strategyId = await createStrategy("column-limit");
    let sessionId: string | null = null;
    try {
      const created = await readBody(
        await postOwnedSession(
          sessionBody(strategyId, {
            investmentLines: [
              investmentLine("Column limit", "1", "999999999999.99999999"),
            ],
          }),
        ),
      );
      expectStatus(created, 201);
      sessionId = MapSessionSchema.parse(created.json).id;

      const line = (await fetchSession(sessionId)).investmentLines[0];
      expect(line?.quantity).toBe("1");
      expect(line?.unitValueChaos).toBe("999999999999.99999999");
      expect(line?.lineTotalChaos).toBe("999999999999.99999999");
    } finally {
      await removeOwned(strategyId, sessionId);
    }
  });

  it("round-trips a map count at the integer limit", async () => {
    const strategyId = await createStrategy("int-limit");
    let sessionId: string | null = null;
    try {
      const created = await readBody(
        await postOwnedSession(
          sessionBody(strategyId, { mapsCompleted: 2_147_483_647 }),
        ),
      );
      expectStatus(created, 201);
      sessionId = MapSessionSchema.parse(created.json).id;

      const session = await fetchSession(sessionId);
      expect(session.mapsCompleted).toBe(2_147_483_647);
    } finally {
      await removeOwned(strategyId, sessionId);
    }
  });

  it("round-trips the price time", async () => {
    const strategyId = await createStrategy("price-time");
    let sessionId: string | null = null;
    try {
      const created = await readBody(
        await postOwnedSession(
          sessionBody(strategyId, {
            investmentLines: [
              investmentLine("Stamped line", "1", "1", DISTINCT_PRICED_AT),
            ],
          }),
        ),
      );
      expectStatus(created, 201);
      sessionId = MapSessionSchema.parse(created.json).id;

      const line = (await fetchSession(sessionId)).investmentLines[0];
      expect(line?.priceRecordedAt).toBe(DISTINCT_PRICED_AT);
    } finally {
      await removeOwned(strategyId, sessionId);
    }
  });

  it("keeps the session id when lines are replaced", async () => {
    const strategyId = await createStrategy("replace-lines");
    let sessionId: string | null = null;
    try {
      const created = await readBody(
        await postOwnedSession(
          sessionBody(strategyId, {
            investmentLines: [investmentLine("Old line", "1", "1")],
          }),
        ),
      );
      expectStatus(created, 201);
      const createdSession = MapSessionSchema.parse(created.json);
      sessionId = createdSession.id;

      const replaced = await readBody(
        await putSession(
          new Request("http://localhost/api/map-sessions/" + sessionId, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(
              sessionBody(strategyId, {
                investmentLines: [investmentLine("New line", "2", "3")],
              }),
            ),
          }),
          idContext(sessionId),
        ),
      );
      expectStatus(replaced, 200);

      const session = await fetchSession(sessionId);
      expect(session.id).toBe(createdSession.id);
      expect(session.investmentLines.map((line) => line.name)).toEqual([
        "New line",
      ]);

      const removed = await deleteSession(
        new Request("http://localhost/api/map-sessions/" + sessionId, {
          method: "DELETE",
        }),
        idContext(sessionId),
      );
      expect(removed.status).toBe(204);
      sessionId = null;
    } finally {
      await removeOwned(strategyId, sessionId);
    }
  });

  it("keeps a strategy that still has a session", async () => {
    const strategyId = await createStrategy("restrict");
    let sessionId: string | null = null;
    try {
      const created = await readBody(
        await postOwnedSession(sessionBody(strategyId)),
      );
      expectStatus(created, 201);
      sessionId = MapSessionSchema.parse(created.json).id;

      const denied = await deleteStrategy(
        new Request("http://localhost/api/strategies/" + strategyId, {
          method: "DELETE",
        }),
        idContext(strategyId),
      );
      expect(denied.status).toBe(409);

      const stillThere = await readBody(
        await getStrategy(
          new Request("http://localhost/api/strategies/" + strategyId),
          idContext(strategyId),
        ),
      );
      expectStatus(stillThere, 200);
      expect(StrategySchema.parse(stillThere.json).id).toBe(strategyId);

      let caught: unknown;
      try {
        await prisma.strategy.delete({ where: { id: strategyId } });
      } catch (error) {
        caught = error;
      }
      expect(isForeignKeyRestrictError(caught)).toBe(true);

      const afterConstraint = await getStrategy(
        new Request("http://localhost/api/strategies/" + strategyId),
        idContext(strategyId),
      );
      expect(afterConstraint.status).toBe(200);
    } finally {
      await removeOwned(strategyId, sessionId);
    }
  });
});
