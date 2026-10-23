import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { calculateSession, calculateStrategyCosts } from "../src/domain/calc";

/**
 * Demo data for local dev and the public deploy.
 *
 * Calculated C1/C2 columns come from the calc engine so seed data and API
 * data agree by construction. Expected snapshot (round numbers; a wrong
 * engine call is obvious at a glance):
 *
 * Strategy (per map):
 *   waystone 2 + expedition tablet 1×7/1 use + temple tablet 1×1/1 use = 10 chaos/map
 *
 * Session (40 maps, extrapolated 10 maps / 20 min = 2 min per map):
 *   map investment      40 × 2                   =    80
 *   investment lines    40×7 + 40×1              =   320
 *   total investment                             =   400
 *   revenue             8×200 + 30×14 + 60×5     =  2320
 *   profit                                       =  1920
 *   duration            40 × 2 min               =    80 min
 *   profit / hour       1920 ÷ (80/60)           =  1440
 *   profit / map        1920 ÷ 40                =    48
 *   maps / hour         40 ÷ (80/60)             =    30
 *   ROI %               1920 ÷ 400 × 100         =   480
 *   profit in divine    1920 ÷ 200               =     9.6
 */

const STRATEGY_ID = "seed_strategy_poe2_expedition";
const MAP_SESSION_ID = "seed_map_session_poe2_expedition";

const PRICED_AT = new Date("2026-01-01T00:00:00.000Z");
const MAP_UNIT_COST_CHAOS = "2";
const MAPS_COMPLETED = 40;

const STRATEGY_ENHANCEMENTS = [
  {
    name: "Expedition Tablet",
    modifierNotes: "+% expedition artifact quantity",
    quantity: "1",
    unitCostChaos: "7",
    uses: 1,
    sortOrder: 0,
  },
  {
    name: "Temple Tablet",
    modifierNotes: "+% monster pack size",
    quantity: "1",
    unitCostChaos: "1",
    uses: 1,
    sortOrder: 1,
  },
] as const;

const SESSION_INVESTMENT_LINES = [
  {
    name: "Expedition Tablet",
    quantity: "40",
    unitValueChaos: "7",
    sortOrder: 0,
  },
  {
    name: "Temple Tablet",
    quantity: "40",
    unitValueChaos: "1",
    sortOrder: 1,
  },
] as const;

const SESSION_REVENUE_LINES = [
  {
    name: "Divine Orb",
    category: "Currency",
    quantity: "8",
    unitValueChaos: "200",
    sortOrder: 0,
  },
  {
    name: "Exalted Orb",
    category: "Currency",
    quantity: "30",
    unitValueChaos: "14",
    sortOrder: 1,
  },
  {
    name: "Expedition Tablet",
    category: "Tablets",
    quantity: "60",
    unitValueChaos: "5",
    sortOrder: 2,
  },
] as const;

function decimalString(value: { toString(): string } | null): string | null {
  return value === null ? null : value.toString();
}

export async function seedDemoData(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    await writeDemoData(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

async function writeDemoData(prisma: PrismaClient): Promise<void> {
  const strategyCosts = calculateStrategyCosts({
    mapUnitCostChaos: MAP_UNIT_COST_CHAOS,
    enhancementLines: STRATEGY_ENHANCEMENTS.map((line) => ({
      quantity: line.quantity,
      unitCostChaos: line.unitCostChaos,
      uses: line.uses,
    })),
  });

  const session = calculateSession({
    mapsCompleted: MAPS_COMPLETED,
    mapUnitCostChaos: MAP_UNIT_COST_CHAOS,
    investmentLines: SESSION_INVESTMENT_LINES.map((line) => ({
      quantity: line.quantity,
      unitValueChaos: line.unitValueChaos,
    })),
    revenueLines: SESSION_REVENUE_LINES.map((line) => ({
      quantity: line.quantity,
      unitValueChaos: line.unitValueChaos,
    })),
    duration: {
      durationMethod: "EXTRAPOLATED",
      sampleMapsCompleted: 10,
      sampleDurationMinutes: "20",
    },
    divineRateChaos: "200",
  });

  // Re-runnable: drop the seed rows (lines cascade) before recreating them.
  await prisma.mapSession.deleteMany({ where: { id: MAP_SESSION_ID } });
  await prisma.strategy.deleteMany({ where: { id: STRATEGY_ID } });

  await prisma.strategy.create({
    data: {
      id: STRATEGY_ID,
      name: "Expedition + Temple tablets (demo)",
      game: "POE2",
      description:
        "Demo strategy: run expedition and temple tablets on tier 15 waystones.",
      mapNotes: "T15 waystone, prefer +% quantity and +% rarity mods.",
      mapUnitCostChaos: MAP_UNIT_COST_CHAOS,
      divineRateChaos: null,
      estimatedCostPerMapChaos:
        strategyCosts.estimatedCostPerMapChaos.toString(),
      enhancementLines: {
        create: STRATEGY_ENHANCEMENTS.map((line, index) => ({
          name: line.name,
          modifierNotes: line.modifierNotes,
          quantity: line.quantity,
          userCostInput: line.unitCostChaos,
          currency: "CHAOS",
          unitCostChaos: line.unitCostChaos,
          uses: line.uses,
          lineTotalChaos:
            strategyCosts.enhancementLineTotals[index]!.toString(),
          sortOrder: line.sortOrder,
        })),
      },
    },
  });

  await prisma.mapSession.create({
    data: {
      id: MAP_SESSION_ID,
      strategyId: STRATEGY_ID,
      mapsCompleted: MAPS_COMPLETED,
      mapUnitCostChaos: MAP_UNIT_COST_CHAOS,
      divineRateChaos: "200",
      notes: "Demo session used for local dev and the public deploy.",
      durationMethod: "EXTRAPOLATED",
      sampleMapsCompleted: 10,
      sampleDurationMinutes: "20",
      mapInvestmentChaos: session.mapInvestmentChaos.toString(),
      totalInvestmentChaos: session.totalInvestmentChaos.toString(),
      totalRevenueChaos: session.totalRevenueChaos.toString(),
      profitChaos: session.profitChaos.toString(),
      effectiveDurationMinutes: session.effectiveDurationMinutes.toString(),
      profitPerHourChaos: decimalString(session.profitPerHourChaos),
      profitPerMapChaos: decimalString(session.profitPerMapChaos),
      mapsPerHour: decimalString(session.mapsPerHour),
      roiPercent: decimalString(session.roiPercent),
      profitDivineApprox: decimalString(session.profitDivineApprox),
      investmentLines: {
        create: SESSION_INVESTMENT_LINES.map((line, index) => ({
          name: line.name,
          quantity: line.quantity,
          unitValueChaos: line.unitValueChaos,
          priceRecordedAt: PRICED_AT,
          lineTotalChaos: session.investmentLineTotals[index]!.toString(),
          sortOrder: line.sortOrder,
        })),
      },
      revenueLines: {
        create: SESSION_REVENUE_LINES.map((line, index) => ({
          name: line.name,
          category: line.category,
          quantity: line.quantity,
          unitValueChaos: line.unitValueChaos,
          priceRecordedAt: PRICED_AT,
          lineTotalChaos: session.revenueLineTotals[index]!.toString(),
          sortOrder: line.sortOrder,
        })),
      },
    },
  });

  console.log("Seeded 1 strategy and 1 map session.");
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return path.resolve(entry) === path.resolve(fileURLToPath(import.meta.url));
}

if (isDirectRun()) {
  seedDemoData().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
