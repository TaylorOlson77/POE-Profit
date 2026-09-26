import type { PrismaClient } from "@prisma/client";

type DurationMethod = "EXTRAPOLATED" | "OBSERVED" | "MANUAL";

type StoredLine = {
  id: string;
  name: string;
  category: string | null;
  quantity: string;
  unitValueChaos: string;
  priceRecordedAt: Date;
  priceSource: "MANUAL";
  valuationType: "ACTUAL_PAID";
  lineTotalChaos: string;
  sortOrder: number;
};

type StoredSession = {
  id: string;
  strategyId: string;
  mapsCompleted: number;
  mapUnitCostChaos: string;
  divineRateChaos: string;
  notes: string | null;
  durationMethod: DurationMethod;
  sampleMapsCompleted: number | null;
  sampleDurationMinutes: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  manualDurationMinutes: string | null;
  mapInvestmentChaos: string;
  totalInvestmentChaos: string;
  totalRevenueChaos: string;
  profitChaos: string;
  effectiveDurationMinutes: string;
  profitPerHourChaos: string | null;
  profitPerMapChaos: string | null;
  mapsPerHour: string | null;
  roiPercent: string | null;
  profitDivineApprox: string | null;
  createdAt: Date;
  updatedAt: Date;
  investmentLines: StoredLine[];
  revenueLines: StoredLine[];
};

type Money = { toString(): string };

type LineCreate = {
  name: string;
  category?: string;
  quantity: Money;
  unitValueChaos: Money;
  priceRecordedAt: Date;
  priceSource: "MANUAL";
  valuationType: "ACTUAL_PAID";
  lineTotalChaos: Money;
  sortOrder: number;
};

type SessionData = {
  strategyId: string;
  mapsCompleted: number;
  mapUnitCostChaos: Money;
  divineRateChaos: Money;
  notes?: string | null;
  durationMethod: DurationMethod;
  sampleMapsCompleted: number | null;
  sampleDurationMinutes: Money | null;
  startedAt: Date | null;
  endedAt: Date | null;
  manualDurationMinutes: Money | null;
  mapInvestmentChaos: Money;
  totalInvestmentChaos: Money;
  totalRevenueChaos: Money;
  profitChaos: Money;
  effectiveDurationMinutes: Money;
  profitPerHourChaos: Money | null;
  profitPerMapChaos: Money | null;
  mapsPerHour: Money | null;
  roiPercent: Money | null;
  profitDivineApprox: Money | null;
  investmentLines?: { create: LineCreate[] };
  revenueLines?: { create: LineCreate[] };
};

const state = {
  strategyIds: new Set<string>(),
  rows: [] as StoredSession[],
  seq: 0,
  clock: Date.parse("2026-09-14T20:00:00.000Z"),
};

function nextId(prefix: string): string {
  state.seq += 1;
  return `${prefix}_${state.seq}`;
}

function nextTimestamp(): Date {
  const created = new Date(state.clock);
  state.clock += 1000;
  return created;
}

function money(value: Money | null): string | null {
  return value === null ? null : value.toString();
}

function asLine(line: LineCreate, kind: "investment" | "revenue"): StoredLine {
  return {
    id: nextId(kind),
    name: line.name,
    category: line.category ?? null,
    quantity: line.quantity.toString(),
    unitValueChaos: line.unitValueChaos.toString(),
    priceRecordedAt: line.priceRecordedAt,
    priceSource: line.priceSource,
    valuationType: line.valuationType,
    lineTotalChaos: line.lineTotalChaos.toString(),
    sortOrder: line.sortOrder,
  };
}

function applyData(session: StoredSession, data: SessionData): void {
  session.strategyId = data.strategyId;
  session.mapsCompleted = data.mapsCompleted;
  session.mapUnitCostChaos = data.mapUnitCostChaos.toString();
  session.divineRateChaos = data.divineRateChaos.toString();
  session.notes = data.notes ?? null;
  session.durationMethod = data.durationMethod;
  session.sampleMapsCompleted = data.sampleMapsCompleted;
  session.sampleDurationMinutes = money(data.sampleDurationMinutes);
  session.startedAt = data.startedAt;
  session.endedAt = data.endedAt;
  session.manualDurationMinutes = money(data.manualDurationMinutes);
  session.mapInvestmentChaos = data.mapInvestmentChaos.toString();
  session.totalInvestmentChaos = data.totalInvestmentChaos.toString();
  session.totalRevenueChaos = data.totalRevenueChaos.toString();
  session.profitChaos = data.profitChaos.toString();
  session.effectiveDurationMinutes = data.effectiveDurationMinutes.toString();
  session.profitPerHourChaos = money(data.profitPerHourChaos);
  session.profitPerMapChaos = money(data.profitPerMapChaos);
  session.mapsPerHour = money(data.mapsPerHour);
  session.roiPercent = money(data.roiPercent);
  session.profitDivineApprox = money(data.profitDivineApprox);
  if (data.investmentLines) {
    session.investmentLines.push(
      ...data.investmentLines.create.map((line) => asLine(line, "investment")),
    );
  }
  if (data.revenueLines) {
    session.revenueLines.push(
      ...data.revenueLines.create.map((line) => asLine(line, "revenue")),
    );
  }
}

function toRow(session: StoredSession) {
  return {
    ...session,
    investmentLines: [...session.investmentLines].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    ),
    revenueLines: [...session.revenueLines].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    ),
  };
}

const mapSessionDelegate = {
  async findMany() {
    return [...state.rows]
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .map(toRow);
  },
  async findUnique(args: { where: { id: string } }) {
    const session = state.rows.find((item) => item.id === args.where.id);
    return session ? toRow(session) : null;
  },
  async create(args: { data: SessionData }) {
    const now = nextTimestamp();
    const session: StoredSession = {
      id: nextId("session"),
      strategyId: "",
      mapsCompleted: 0,
      mapUnitCostChaos: "0",
      divineRateChaos: "0",
      notes: null,
      durationMethod: "EXTRAPOLATED",
      sampleMapsCompleted: null,
      sampleDurationMinutes: null,
      startedAt: null,
      endedAt: null,
      manualDurationMinutes: null,
      mapInvestmentChaos: "0",
      totalInvestmentChaos: "0",
      totalRevenueChaos: "0",
      profitChaos: "0",
      effectiveDurationMinutes: "0",
      profitPerHourChaos: null,
      profitPerMapChaos: null,
      mapsPerHour: null,
      roiPercent: null,
      profitDivineApprox: null,
      createdAt: now,
      updatedAt: now,
      investmentLines: [],
      revenueLines: [],
    };
    applyData(session, args.data);
    state.rows.push(session);
    return toRow(session);
  },
  async update(args: { where: { id: string }; data: SessionData }) {
    const session = state.rows.find((item) => item.id === args.where.id);
    if (!session) {
      return null;
    }
    session.updatedAt = nextTimestamp();
    applyData(session, args.data);
    return toRow(session);
  },
  async delete(args: { where: { id: string } }) {
    const index = state.rows.findIndex((item) => item.id === args.where.id);
    if (index === -1) {
      throw { code: "P2025", clientVersion: "test" };
    }
    state.rows.splice(index, 1);
    return { id: args.where.id };
  },
};

function lineDelegate(kind: "investmentLines" | "revenueLines") {
  return {
    async deleteMany(args: { where: { mapSessionId: string } }) {
      const session = state.rows.find((item) => item.id === args.where.mapSessionId);
      if (!session) {
        return { count: 0 };
      }
      const count = session[kind].length;
      session[kind] = [];
      return { count };
    },
  };
}

export const fakePrisma = {
  strategy: {
    async findUnique(args: { where: { id: string } }) {
      return state.strategyIds.has(args.where.id) ? { id: args.where.id } : null;
    },
  },
  mapSession: mapSessionDelegate,
  mapSessionInvestmentLine: lineDelegate("investmentLines"),
  mapSessionRevenueLine: lineDelegate("revenueLines"),
  $transaction: async <T>(fn: (tx: typeof fakePrisma) => Promise<T>) => fn(fakePrisma),
} as unknown as PrismaClient;

export function resetMapSessionDb(): void {
  state.strategyIds = new Set();
  state.rows = [];
  state.seq = 0;
  state.clock = Date.parse("2026-09-14T20:00:00.000Z");
}

export function seedStrategy(id: string): void {
  state.strategyIds.add(id);
}
