import { PrismaClient } from "@prisma/client";

/**
 * Demo data for local dev and the public deploy (backlog B3).
 *
 * The calculated columns below are **hand-computed** on purpose: the calc
 * engine does not exist yet (Epic C). Once C2 lands, this file should build the
 * rows through the engine instead so seed data and API data agree by
 * construction. The numbers are deliberately round so a wrong calculation is
 * obvious at a glance.
 *
 * Strategy (per map):
 *   waystone 2 + expedition tablet 1×7 + temple tablet 1×1 = 10 chaos/map
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

const prisma = new PrismaClient();

const STRATEGY_ID = "seed_strategy_poe2_expedition";
const MAP_SESSION_ID = "seed_map_session_poe2_expedition";

const PRICED_AT = new Date("2026-01-01T00:00:00.000Z");

async function main() {
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
      mapUnitCostChaos: "2",
      estimatedCostPerMapChaos: "10",
      enhancementLines: {
        create: [
          {
            name: "Expedition Tablet",
            modifierNotes: "+% expedition artifact quantity",
            quantity: "1",
            unitCostChaos: "7",
            lineTotalChaos: "7",
            sortOrder: 0,
          },
          {
            name: "Temple Tablet",
            modifierNotes: "+% monster pack size",
            quantity: "1",
            unitCostChaos: "1",
            lineTotalChaos: "1",
            sortOrder: 1,
          },
        ],
      },
    },
  });

  await prisma.mapSession.create({
    data: {
      id: MAP_SESSION_ID,
      strategyId: STRATEGY_ID,
      mapsCompleted: 40,
      mapUnitCostChaos: "2",
      divineRateChaos: "200",
      notes: "Demo session used for local dev and the public deploy.",
      durationMethod: "EXTRAPOLATED",
      sampleMapsCompleted: 10,
      sampleDurationMinutes: "20",
      mapInvestmentChaos: "80",
      totalInvestmentChaos: "400",
      totalRevenueChaos: "2320",
      profitChaos: "1920",
      effectiveDurationMinutes: "80",
      profitPerHourChaos: "1440",
      profitPerMapChaos: "48",
      mapsPerHour: "30",
      roiPercent: "480",
      profitDivineApprox: "9.6",
      investmentLines: {
        create: [
          {
            name: "Expedition Tablet",
            quantity: "40",
            unitValueChaos: "7",
            priceRecordedAt: PRICED_AT,
            lineTotalChaos: "280",
            sortOrder: 0,
          },
          {
            name: "Temple Tablet",
            quantity: "40",
            unitValueChaos: "1",
            priceRecordedAt: PRICED_AT,
            lineTotalChaos: "40",
            sortOrder: 1,
          },
        ],
      },
      revenueLines: {
        create: [
          {
            name: "Divine Orb",
            category: "Currency",
            quantity: "8",
            unitValueChaos: "200",
            priceRecordedAt: PRICED_AT,
            lineTotalChaos: "1600",
            sortOrder: 0,
          },
          {
            name: "Exalted Orb",
            category: "Currency",
            quantity: "30",
            unitValueChaos: "14",
            priceRecordedAt: PRICED_AT,
            lineTotalChaos: "420",
            sortOrder: 1,
          },
          {
            name: "Expedition Tablet",
            category: "Tablets",
            quantity: "60",
            unitValueChaos: "5",
            priceRecordedAt: PRICED_AT,
            lineTotalChaos: "300",
            sortOrder: 2,
          },
        ],
      },
    },
  });

  console.log("Seeded 1 strategy and 1 map session.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
