import type { Prisma, PrismaClient } from "@prisma/client";
import type {
  CreateMapSessionBody,
  MapSession,
  MapSessionInvestmentLine,
  MapSessionRevenueLine,
} from "@/src/contracts/mapSessions";
import {
  calculateSession,
  type SessionCalcResult,
  type SessionDurationInput,
} from "@/src/domain/calc";
import { decimalToWire, fitsMoneyColumn, nullableDecimalToWire } from "@/src/server/money";

const mapSessionInclude = {
  investmentLines: { orderBy: { sortOrder: "asc" as const } },
  revenueLines: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.MapSessionInclude;

type MapSessionRow = Prisma.MapSessionGetPayload<{
  include: typeof mapSessionInclude;
}>;

export type CreateMapSessionResult =
  | { status: "created"; session: MapSession }
  | { status: "strategy_not_found" }
  | { status: "total_overflow" };

export type UpdateMapSessionResult =
  | { status: "updated"; session: MapSession }
  | { status: "not_found" }
  | { status: "strategy_not_found" }
  | { status: "total_overflow" };

export type DeleteMapSessionResult =
  | { status: "deleted" }
  | { status: "not_found" };

function persistedDecimal(value: { toString(): string } | null): string | null {
  return value === null ? null : value.toString();
}

function lineTotalAt(
  totals: ReadonlyArray<{ toString(): string }>,
  index: number,
): string {
  const total = totals[index];
  if (total === undefined) {
    throw new Error(`Missing calculated line total at index ${index}`);
  }
  return total.toString();
}

function durationForEngine(body: CreateMapSessionBody): SessionDurationInput {
  switch (body.durationMethod) {
    case "EXTRAPOLATED":
      return {
        durationMethod: "EXTRAPOLATED",
        sampleMapsCompleted: body.sampleMapsCompleted,
        sampleDurationMinutes: body.sampleDurationMinutes,
      };
    case "OBSERVED":
      return {
        durationMethod: "OBSERVED",
        startedAt: body.startedAt,
        endedAt: body.endedAt,
      };
    case "MANUAL":
      return {
        durationMethod: "MANUAL",
        manualDurationMinutes: body.manualDurationMinutes,
      };
  }
}

/**
 * Only the active method's columns are written. The others are cleared so a
 * method switch cannot leave a second duration source on the row (ADR-006).
 */
function durationColumns(body: CreateMapSessionBody) {
  switch (body.durationMethod) {
    case "EXTRAPOLATED":
      return {
        durationMethod: "EXTRAPOLATED" as const,
        sampleMapsCompleted: body.sampleMapsCompleted,
        sampleDurationMinutes: body.sampleDurationMinutes,
        startedAt: null,
        endedAt: null,
        manualDurationMinutes: null,
      };
    case "OBSERVED":
      return {
        durationMethod: "OBSERVED" as const,
        sampleMapsCompleted: null,
        sampleDurationMinutes: null,
        startedAt: new Date(body.startedAt),
        endedAt: new Date(body.endedAt),
        manualDurationMinutes: null,
      };
    case "MANUAL":
      return {
        durationMethod: "MANUAL" as const,
        sampleMapsCompleted: null,
        sampleDurationMinutes: null,
        startedAt: null,
        endedAt: null,
        manualDurationMinutes: body.manualDurationMinutes,
      };
  }
}

function sessionCalculated(body: CreateMapSessionBody): SessionCalcResult {
  return calculateSession({
    mapsCompleted: body.mapsCompleted,
    mapUnitCostChaos: body.mapUnitCostChaos,
    investmentLines: body.investmentLines.map((line) => ({
      quantity: line.quantity,
      unitValueChaos: line.unitValueChaos,
    })),
    revenueLines: body.revenueLines.map((line) => ({
      quantity: line.quantity,
      unitValueChaos: line.unitValueChaos,
    })),
    duration: durationForEngine(body),
    divineRateChaos: body.divineRateChaos,
  });
}

/** Every decimal about to be written, including rates. Null rates are skipped. */
function sessionTotalsFit(calculated: SessionCalcResult): boolean {
  return [
    calculated.mapInvestmentChaos,
    calculated.totalInvestmentChaos,
    calculated.totalRevenueChaos,
    calculated.profitChaos,
    calculated.effectiveDurationMinutes,
    ...calculated.investmentLineTotals,
    ...calculated.revenueLineTotals,
    calculated.profitPerHourChaos,
    calculated.profitPerMapChaos,
    calculated.mapsPerHour,
    calculated.roiPercent,
    calculated.profitDivineApprox,
  ].every((value) => value === null || fitsMoneyColumn(value));
}

function sessionData(
  body: CreateMapSessionBody,
  calculated: SessionCalcResult,
): Prisma.MapSessionUncheckedCreateInput {
  return {
    strategyId: body.strategyId,
    mapsCompleted: body.mapsCompleted,
    mapUnitCostChaos: body.mapUnitCostChaos,
    divineRateChaos: body.divineRateChaos,
    notes: body.notes ?? null,
    ...durationColumns(body),
    mapInvestmentChaos: calculated.mapInvestmentChaos.toString(),
    totalInvestmentChaos: calculated.totalInvestmentChaos.toString(),
    totalRevenueChaos: calculated.totalRevenueChaos.toString(),
    profitChaos: calculated.profitChaos.toString(),
    effectiveDurationMinutes: calculated.effectiveDurationMinutes.toString(),
    profitPerHourChaos: persistedDecimal(calculated.profitPerHourChaos),
    profitPerMapChaos: persistedDecimal(calculated.profitPerMapChaos),
    mapsPerHour: persistedDecimal(calculated.mapsPerHour),
    roiPercent: persistedDecimal(calculated.roiPercent),
    profitDivineApprox: persistedDecimal(calculated.profitDivineApprox),
    investmentLines: {
      create: body.investmentLines.map((line, index) => ({
        name: line.name,
        quantity: line.quantity,
        unitValueChaos: line.unitValueChaos,
        priceRecordedAt: new Date(line.priceRecordedAt),
        priceSource: line.priceSource,
        valuationType: line.valuationType,
        lineTotalChaos: lineTotalAt(calculated.investmentLineTotals, index),
        sortOrder: index,
      })),
    },
    revenueLines: {
      create: body.revenueLines.map((line, index) => ({
        name: line.name,
        category: line.category,
        quantity: line.quantity,
        unitValueChaos: line.unitValueChaos,
        priceRecordedAt: new Date(line.priceRecordedAt),
        priceSource: line.priceSource,
        valuationType: line.valuationType,
        lineTotalChaos: lineTotalAt(calculated.revenueLineTotals, index),
        sortOrder: index,
      })),
    },
  };
}

function toInvestmentLine(
  line: MapSessionRow["investmentLines"][number],
): MapSessionInvestmentLine {
  return {
    id: line.id,
    name: line.name,
    quantity: decimalToWire(line.quantity),
    unitValueChaos: decimalToWire(line.unitValueChaos),
    priceRecordedAt: line.priceRecordedAt.toISOString(),
    priceSource: line.priceSource,
    valuationType: line.valuationType,
    lineTotalChaos: decimalToWire(line.lineTotalChaos),
  };
}

function toRevenueLine(
  line: MapSessionRow["revenueLines"][number],
): MapSessionRevenueLine {
  return {
    ...toInvestmentLine(line),
    category: line.category,
  };
}

function calculatedFields(row: MapSessionRow) {
  return {
    totalInvestmentChaos: decimalToWire(row.totalInvestmentChaos),
    totalRevenueChaos: decimalToWire(row.totalRevenueChaos),
    profitChaos: decimalToWire(row.profitChaos),
    mapInvestmentChaos: decimalToWire(row.mapInvestmentChaos),
    effectiveDurationMinutes: decimalToWire(row.effectiveDurationMinutes),
    profitPerHourChaos: nullableDecimalToWire(row.profitPerHourChaos),
    profitPerMapChaos: nullableDecimalToWire(row.profitPerMapChaos),
    mapsPerHour: nullableDecimalToWire(row.mapsPerHour),
    roiPercent: nullableDecimalToWire(row.roiPercent),
    profitDivineApprox: nullableDecimalToWire(row.profitDivineApprox),
  };
}

function toMapSession(row: MapSessionRow): MapSession {
  const shared = {
    id: row.id,
    strategyId: row.strategyId,
    mapsCompleted: row.mapsCompleted,
    mapUnitCostChaos: decimalToWire(row.mapUnitCostChaos),
    divineRateChaos: decimalToWire(row.divineRateChaos),
    investmentLines: row.investmentLines.map(toInvestmentLine),
    revenueLines: row.revenueLines.map(toRevenueLine),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...calculatedFields(row),
    ...(row.notes == null ? {} : { notes: row.notes }),
  };

  switch (row.durationMethod) {
    case "EXTRAPOLATED": {
      if (row.sampleMapsCompleted == null || row.sampleDurationMinutes == null) {
        throw new Error("Extrapolated session is missing sample fields");
      }
      return {
        ...shared,
        durationMethod: "EXTRAPOLATED",
        durationMethodLabel: "Extrapolated",
        sampleMapsCompleted: row.sampleMapsCompleted,
        sampleDurationMinutes: decimalToWire(row.sampleDurationMinutes),
      };
    }
    case "OBSERVED": {
      if (row.startedAt == null || row.endedAt == null) {
        throw new Error("Observed session is missing start or end");
      }
      return {
        ...shared,
        durationMethod: "OBSERVED",
        durationMethodLabel: "Observed",
        startedAt: row.startedAt.toISOString(),
        endedAt: row.endedAt.toISOString(),
      };
    }
    case "MANUAL": {
      if (row.manualDurationMinutes == null) {
        throw new Error("Manual session is missing duration");
      }
      return {
        ...shared,
        durationMethod: "MANUAL",
        durationMethodLabel: "Manual",
        manualDurationMinutes: decimalToWire(row.manualDurationMinutes),
      };
    }
  }
}

export async function listMapSessions(db: PrismaClient): Promise<MapSession[]> {
  const rows = await db.mapSession.findMany({
    orderBy: { createdAt: "desc" },
    include: mapSessionInclude,
  });
  return rows.map(toMapSession);
}

export async function getMapSession(
  db: PrismaClient,
  id: string,
): Promise<MapSession | null> {
  const row = await db.mapSession.findUnique({
    where: { id },
    include: mapSessionInclude,
  });
  return row ? toMapSession(row) : null;
}

export async function createMapSession(
  db: PrismaClient,
  body: CreateMapSessionBody,
): Promise<CreateMapSessionResult> {
  const strategy = await db.strategy.findUnique({
    where: { id: body.strategyId },
  });
  if (!strategy) {
    return { status: "strategy_not_found" };
  }

  const calculated = sessionCalculated(body);
  if (!sessionTotalsFit(calculated)) {
    return { status: "total_overflow" };
  }

  const row = await db.mapSession.create({
    data: sessionData(body, calculated),
    include: mapSessionInclude,
  });
  return { status: "created", session: toMapSession(row) };
}

/**
 * Full replace of writable fields and both line sets. The session row and
 * its strategy stay; cascade only runs when the session itself is deleted.
 */
export async function updateMapSession(
  db: PrismaClient,
  id: string,
  body: CreateMapSessionBody,
): Promise<UpdateMapSessionResult> {
  const calculated = sessionCalculated(body);
  if (!sessionTotalsFit(calculated)) {
    return { status: "total_overflow" };
  }

  const row = await db.$transaction(async (tx) => {
    const existing = await tx.mapSession.findUnique({ where: { id } });
    if (!existing) {
      return { kind: "not_found" as const };
    }
    const strategy = await tx.strategy.findUnique({
      where: { id: body.strategyId },
    });
    if (!strategy) {
      return { kind: "strategy_not_found" as const };
    }
    await tx.mapSessionInvestmentLine.deleteMany({ where: { mapSessionId: id } });
    await tx.mapSessionRevenueLine.deleteMany({ where: { mapSessionId: id } });
    const updated = await tx.mapSession.update({
      where: { id },
      data: sessionData(body, calculated),
      include: mapSessionInclude,
    });
    return { kind: "updated" as const, session: updated };
  });

  if (row.kind === "not_found") {
    return { status: "not_found" };
  }
  if (row.kind === "strategy_not_found") {
    return { status: "strategy_not_found" };
  }
  return { status: "updated", session: toMapSession(row.session) };
}

export async function deleteMapSession(
  db: PrismaClient,
  id: string,
): Promise<DeleteMapSessionResult> {
  const existing = await db.mapSession.findUnique({ where: { id } });
  if (!existing) {
    return { status: "not_found" };
  }
  await db.mapSession.delete({ where: { id } });
  return { status: "deleted" };
}
