import type { Prisma, PrismaClient } from "@prisma/client";
import type { Strategy, UpdateStrategyBody } from "@/src/contracts/strategies";
import { calculateStrategyCosts } from "@/src/domain/calc";
import { isForeignKeyRestrictError } from "@/src/server/apiError";
import { decimalToWire } from "@/src/server/money";

const strategyInclude = {
  enhancementLines: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.StrategyInclude;

type StrategyRow = Prisma.StrategyGetPayload<{ include: typeof strategyInclude }>;

export type DeleteStrategyResult =
  | { status: "deleted" }
  | { status: "not_found" }
  | { status: "conflict" };

function costFields(body: UpdateStrategyBody) {
  const costs = calculateStrategyCosts({
    mapUnitCostChaos: body.mapUnitCostChaos,
    enhancementLines: body.enhancementLines.map((line) => ({
      quantity: line.quantity,
      unitCostChaos: line.unitCostChaos,
    })),
  });

  return {
    estimatedCostPerMapChaos: costs.estimatedCostPerMapChaos.toString(),
    enhancementLines: {
      create: body.enhancementLines.map((line, index) => ({
        name: line.name,
        modifierNotes: line.modifierNotes ?? null,
        quantity: line.quantity,
        unitCostChaos: line.unitCostChaos,
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
): Promise<Strategy> {
  const row = await db.strategy.create({
    data: {
      name: body.name,
      game: body.game,
      description: body.description,
      mapNotes: body.mapNotes ?? null,
      mapUnitCostChaos: body.mapUnitCostChaos,
      ...costFields(body),
    },
    include: strategyInclude,
  });
  return toStrategy(row);
}

/** Full replace of writable fields and enhancement lines. */
export async function updateStrategy(
  db: PrismaClient,
  id: string,
  body: UpdateStrategyBody,
): Promise<Strategy | null> {
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
        ...costFields(body),
      },
      include: strategyInclude,
    });
  });
  return row ? toStrategy(row) : null;
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
