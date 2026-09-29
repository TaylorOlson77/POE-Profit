import type { Prisma, PrismaClient } from "@prisma/client";
import type { Strategy, UpdateStrategyBody } from "@/src/contracts/strategies";
import {
  calculateStrategyCosts,
  type StrategyCostsResult,
} from "@/src/domain/calc";
import { isForeignKeyRestrictError } from "@/src/server/apiError";
import { decimalToWire, fitsMoneyColumn } from "@/src/server/money";

const strategyInclude = {
  enhancementLines: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.StrategyInclude;

type StrategyRow = Prisma.StrategyGetPayload<{ include: typeof strategyInclude }>;

export type DeleteStrategyResult =
  | { status: "deleted" }
  | { status: "not_found" }
  | { status: "conflict" };

export type CreateStrategyResult =
  | { status: "created"; strategy: Strategy }
  | { status: "total_overflow" };

export type UpdateStrategyResult =
  | { status: "updated"; strategy: Strategy }
  | { status: "not_found" }
  | { status: "total_overflow" };

function strategyCosts(body: UpdateStrategyBody): StrategyCostsResult {
  return calculateStrategyCosts({
    mapUnitCostChaos: body.mapUnitCostChaos,
    enhancementLines: body.enhancementLines.map((line) => ({
      quantity: line.quantity,
      unitCostChaos: line.unitCostChaos,
      uses: line.uses,
    })),
  });
}

function strategyCostsFit(costs: StrategyCostsResult): boolean {
  return [costs.estimatedCostPerMapChaos, ...costs.enhancementLineTotals].every(
    (value) => fitsMoneyColumn(value),
  );
}

function costFields(body: UpdateStrategyBody, costs: StrategyCostsResult) {
  return {
    estimatedCostPerMapChaos: costs.estimatedCostPerMapChaos.toString(),
    enhancementLines: {
      create: body.enhancementLines.map((line, index) => ({
        name: line.name,
        modifierNotes: line.modifierNotes ?? null,
        quantity: line.quantity,
        unitCostChaos: line.unitCostChaos,
        uses: line.uses,
        lineTotalChaos: costs.enhancementLineTotals[index].toString(),
        sortOrder: line.sortOrder ?? index,
      })),
    },
  };
}

function toStrategy(row: StrategyRow): Strategy {
  const strategy: Strategy = {
    id: row.id,
    name: row.name,
    game: row.game,
    description: row.description,
    mapUnitCostChaos: decimalToWire(row.mapUnitCostChaos),
    enhancementLines: row.enhancementLines.map((line) => {
      const mapped = {
        id: line.id,
        name: line.name,
        quantity: decimalToWire(line.quantity),
        unitCostChaos: decimalToWire(line.unitCostChaos),
        uses: line.uses,
        lineTotalChaos: decimalToWire(line.lineTotalChaos),
        sortOrder: line.sortOrder,
      };
      if (line.modifierNotes == null) {
        return mapped;
      }
      return { ...mapped, modifierNotes: line.modifierNotes };
    }),
    estimatedCostPerMapChaos: decimalToWire(row.estimatedCostPerMapChaos),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };

  if (row.mapNotes == null) {
    return strategy;
  }
  return { ...strategy, mapNotes: row.mapNotes };
}

export async function listStrategies(db: PrismaClient): Promise<Strategy[]> {
  const rows = await db.strategy.findMany({
    orderBy: { createdAt: "desc" },
    include: strategyInclude,
  });
  return rows.map(toStrategy);
}

export async function getStrategy(
  db: PrismaClient,
  id: string,
): Promise<Strategy | null> {
  const row = await db.strategy.findUnique({
    where: { id },
    include: strategyInclude,
  });
  return row ? toStrategy(row) : null;
}

export async function createStrategy(
  db: PrismaClient,
  body: UpdateStrategyBody,
): Promise<CreateStrategyResult> {
  const costs = strategyCosts(body);
  if (!strategyCostsFit(costs)) {
    return { status: "total_overflow" };
  }

  const row = await db.strategy.create({
    data: {
      name: body.name,
      game: body.game,
      description: body.description,
      mapNotes: body.mapNotes ?? null,
      mapUnitCostChaos: body.mapUnitCostChaos,
      ...costFields(body, costs),
    },
    include: strategyInclude,
  });
  return { status: "created", strategy: toStrategy(row) };
}

/** Full replace of writable fields and enhancement lines. */
export async function updateStrategy(
  db: PrismaClient,
  id: string,
  body: UpdateStrategyBody,
): Promise<UpdateStrategyResult> {
  const costs = strategyCosts(body);
  if (!strategyCostsFit(costs)) {
    return { status: "total_overflow" };
  }

  const row = await db.$transaction(async (tx) => {
    const existing = await tx.strategy.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }
    await tx.strategyEnhancementLine.deleteMany({ where: { strategyId: id } });
    return tx.strategy.update({
      where: { id },
      data: {
        name: body.name,
        game: body.game,
        description: body.description,
        mapNotes: body.mapNotes ?? null,
        mapUnitCostChaos: body.mapUnitCostChaos,
        ...costFields(body, costs),
      },
      include: strategyInclude,
    });
  });
  return row
    ? { status: "updated", strategy: toStrategy(row) }
    : { status: "not_found" };
}

export async function deleteStrategy(
  db: PrismaClient,
  id: string,
): Promise<DeleteStrategyResult> {
  const existing = await db.strategy.findUnique({
    where: { id },
    include: { _count: { select: { mapSessions: true } } },
  });
  if (!existing) {
    return { status: "not_found" };
  }
  if (existing._count.mapSessions > 0) {
    return { status: "conflict" };
  }

  try {
    await db.strategy.delete({ where: { id } });
  } catch (error) {
    if (isForeignKeyRestrictError(error)) {
      return { status: "conflict" };
    }
    throw error;
  }
  return { status: "deleted" };
}
