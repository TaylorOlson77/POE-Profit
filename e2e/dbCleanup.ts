import { type APIRequestContext, test } from "@playwright/test";
import { MapSessionListResponseSchema } from "../src/contracts/mapSessions";
import { StrategyListResponseSchema } from "../src/contracts/strategies";

/**
 * Rows a describe asks cleanup to handle.
 *
 * With no `keepSessionIds`, every strategy of that name is deleted, sessions
 * first. With `keepSessionIds`, that strategy stays, those sessions stay, and
 * every other session on it is deleted.
 */
export type StrategyRows = {
  name: string;
  keepSessionIds?: readonly string[];
};

/**
 * Deletes the rows `rows` names. Called before a group so a killed run cannot
 * block the next one, and again when the group finishes. Strategies that are
 * not in `rows` stay.
 */
export async function removeStrategies(
  request: APIRequestContext,
  rows: readonly StrategyRows[],
): Promise<void> {
  const strategiesResponse = await request.get("/api/strategies");
  if (!strategiesResponse.ok()) {
    throw new Error(
      `GET /api/strategies failed (${strategiesResponse.status()}): ${await strategiesResponse.text()}`,
    );
  }
  const { strategies } = StrategyListResponseSchema.parse(
    await strategiesResponse.json(),
  );

  const sessionsResponse = await request.get("/api/map-sessions");
  if (!sessionsResponse.ok()) {
    throw new Error(
      `GET /api/map-sessions failed (${sessionsResponse.status()}): ${await sessionsResponse.text()}`,
    );
  }
  const { mapSessions } = MapSessionListResponseSchema.parse(
    await sessionsResponse.json(),
  );

  for (const row of rows) {
    const matches = strategies.filter((strategy) => strategy.name === row.name);
    const matchIds = new Set(matches.map((strategy) => strategy.id));
    if (row.keepSessionIds) {
      if (matches.length === 0) {
        throw new Error(
          `Strategy "${row.name}" is missing. Run npm run db:seed.`,
        );
      }
      const keep = new Set(row.keepSessionIds);
      for (const id of row.keepSessionIds) {
        const kept = mapSessions.find((session) => session.id === id);
        if (!kept || !matchIds.has(kept.strategyId)) {
          throw new Error(
            `Session "${id}" on "${row.name}" is missing. Run npm run db:seed.`,
          );
        }
      }
      for (const session of mapSessions) {
        if (!matchIds.has(session.strategyId) || keep.has(session.id)) {
          continue;
        }
        await deleteSession(request, session.id);
      }
      continue;
    }

    for (const session of mapSessions) {
      if (matchIds.has(session.strategyId)) {
        await deleteSession(request, session.id);
      }
    }
    for (const id of matchIds) {
      await deleteStrategy(request, id);
    }
  }
}

/** beforeAll and afterAll for one describe. Pass the rows that describe owns. */
export function installUiTestCleanup(rows: readonly StrategyRows[]): void {
  let api: APIRequestContext | undefined;

  test.beforeAll(async ({ playwright, baseURL }) => {
    api = await playwright.request.newContext({ baseURL });
    await removeStrategies(api, rows);
  });

  test.afterAll(async () => {
    if (!api) {
      return;
    }
    try {
      await removeStrategies(api, rows);
    } finally {
      await api.dispose();
      api = undefined;
    }
  });
}

async function deleteSession(
  request: APIRequestContext,
  id: string,
): Promise<void> {
  const deleted = await request.delete(`/api/map-sessions/${id}`);
  if (deleted.status() !== 204 && deleted.status() !== 404) {
    throw new Error(
      `DELETE /api/map-sessions/${id} failed (${deleted.status()}): ${await deleted.text()}`,
    );
  }
}

async function deleteStrategy(
  request: APIRequestContext,
  id: string,
): Promise<void> {
  const deleted = await request.delete(`/api/strategies/${id}`);
  if (deleted.status() !== 204 && deleted.status() !== 404) {
    throw new Error(
      `DELETE /api/strategies/${id} failed (${deleted.status()}): ${await deleted.text()}`,
    );
  }
}
