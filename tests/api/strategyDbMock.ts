import Decimal from "decimal.js";
import type { PrismaClient } from "@prisma/client";

type StoredLine = {
  id: string;
  name: string;
  modifierNotes: string | null;
  quantity: string;
  unitCostChaos: string;
  uses: number;
  lineTotalChaos: string;
  sortOrder: number;
};

type StoredStrategy = {
  id: string;
  name: string;
  game: "POE1" | "POE2";
  description: string;
  mapNotes: string | null;
  mapUnitCostChaos: string;
  estimatedCostPerMapChaos: string;
  createdAt: Date;
  updatedAt: Date;
  lines: StoredLine[];
  sessionCount: number;
};

type LineCreate = {
  name: string;
  modifierNotes?: string | null;
  quantity: { toString(): string };
  unitCostChaos: { toString(): string };
  uses: number;
  lineTotalChaos: { toString(): string };
  sortOrder: number;
};

type StrategyData = {
  name: string;
  game: "POE1" | "POE2";
  description: string;
  mapNotes?: string | null;
  mapUnitCostChaos: { toString(): string };
  estimatedCostPerMapChaos: { toString(): string };
  enhancementLines?: { create: LineCreate[] };
};

const state = {
  rows: [] as StoredStrategy[],
  seq: 0,
  clock: Date.parse("2026-09-14T20:00:00.000Z"),
  failNextDelete: null as null | "P2003" | "P2014",
  failNextList: false,
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

function asLine(line: LineCreate): StoredLine {
  return {
    id: nextId("line"),
    name: line.name,
    modifierNotes: line.modifierNotes ?? null,
    quantity: line.quantity.toString(),
    unitCostChaos: line.unitCostChaos.toString(),
    uses: line.uses,
    lineTotalChaos: line.lineTotalChaos.toString(),
    sortOrder: line.sortOrder,
  };
}

function toRow(strategy: StoredStrategy) {
  return {
    id: strategy.id,
    name: strategy.name,
    game: strategy.game,
    description: strategy.description,
    mapNotes: strategy.mapNotes,
    mapUnitCostChaos: new Decimal(strategy.mapUnitCostChaos),
    estimatedCostPerMapChaos: new Decimal(strategy.estimatedCostPerMapChaos),
    createdAt: strategy.createdAt,
    updatedAt: strategy.updatedAt,
    enhancementLines: [...strategy.lines]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((line) => ({
        id: line.id,
        strategyId: strategy.id,
        name: line.name,
        modifierNotes: line.modifierNotes,
        quantity: new Decimal(line.quantity),
        unitCostChaos: new Decimal(line.unitCostChaos),
        uses: line.uses,
        lineTotalChaos: new Decimal(line.lineTotalChaos),
        sortOrder: line.sortOrder,
      })),
  };
}

function applyData(strategy: StoredStrategy, data: StrategyData): void {
  strategy.name = data.name;
  strategy.game = data.game;
  strategy.description = data.description;
  strategy.mapNotes = data.mapNotes ?? null;
  strategy.mapUnitCostChaos = data.mapUnitCostChaos.toString();
  strategy.estimatedCostPerMapChaos = data.estimatedCostPerMapChaos.toString();
  if (data.enhancementLines) {
    strategy.lines.push(...data.enhancementLines.create.map(asLine));
  }
}

const strategyDelegate = {
  async findMany() {
    if (state.failNextList) {
      state.failNextList = false;
      throw new Error("database unavailable");
    }
    return [...state.rows]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(toRow);
  },
  async findUnique(args: {
    where: { id: string };
    include?: { _count?: { select: { mapSessions: boolean } } };
  }) {
    const row = state.rows.find((item) => item.id === args.where.id);
    if (!row) {
      return null;
    }
    if (args.include?._count?.select.mapSessions) {
      return { ...toRow(row), _count: { mapSessions: row.sessionCount } };
    }
    return toRow(row);
  },
  async create(args: { data: StrategyData }) {
    const now = nextTimestamp();
    const strategy: StoredStrategy = {
      id: nextId("strategy"),
      name: "",
      game: "POE2",
      description: "",
      mapNotes: null,
      mapUnitCostChaos: "0",
      estimatedCostPerMapChaos: "0",
      createdAt: now,
      updatedAt: now,
      lines: [],
      sessionCount: 0,
    };
    applyData(strategy, args.data);
    state.rows.push(strategy);
    return toRow(strategy);
  },
  async update(args: { where: { id: string }; data: StrategyData }) {
    const strategy = state.rows.find((item) => item.id === args.where.id);
    if (!strategy) {
      return null;
    }
    strategy.updatedAt = nextTimestamp();
    applyData(strategy, args.data);
    return toRow(strategy);
  },
  async delete(args: { where: { id: string } }) {
    if (state.failNextDelete) {
      const code = state.failNextDelete;
      state.failNextDelete = null;
      throw { code, clientVersion: "test" };
    }
    const index = state.rows.findIndex((item) => item.id === args.where.id);
    if (index === -1) {
      throw { code: "P2025", clientVersion: "test" };
    }
    state.rows.splice(index, 1);
    return { id: args.where.id };
  },
};

const lineDelegate = {
  async deleteMany(args: { where: { strategyId: string } }) {
    const strategy = state.rows.find((item) => item.id === args.where.strategyId);
    if (!strategy) {
      return { count: 0 };
    }
    const count = strategy.lines.length;
    strategy.lines = [];
    return { count };
  },
};

export const fakePrisma = {
  strategy: strategyDelegate,
  strategyEnhancementLine: lineDelegate,
  $transaction: async <T>(fn: (tx: typeof fakePrisma) => Promise<T>) => fn(fakePrisma),
} as unknown as PrismaClient;

export function resetStrategyDb(): void {
  state.rows = [];
  state.seq = 0;
  state.clock = Date.parse("2026-09-14T20:00:00.000Z");
  state.failNextDelete = null;
  state.failNextList = false;
}

export function setSessionCount(id: string, count: number): void {
  const row = state.rows.find((item) => item.id === id);
  if (!row) {
    throw new Error(`No strategy ${id}`);
  }
  row.sessionCount = count;
}

export function failNextDelete(code: "P2003" | "P2014"): void {
  state.failNextDelete = code;
}

export function failNextList(): void {
  state.failNextList = true;
}
