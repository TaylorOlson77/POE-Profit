import { PrismaClient } from "@prisma/client";
import { assertDatabaseResetAllowed } from "../src/server/databaseReset";
import { seedDemoData } from "./seed";

/**
 * Deletes every strategy and map session, then inserts the demo seed.
 *
 * Map sessions go first because the strategy relation is Restrict.
 * Child lines cascade. This does not drop tables or migration history.
 */
async function main(): Promise<void> {
  assertDatabaseResetAllowed({
    DATABASE_RESET: process.env.DATABASE_RESET,
    CI: process.env.CI,
  });

  const prisma = new PrismaClient();
  try {
    await prisma.mapSession.deleteMany();
    await prisma.strategy.deleteMany();
  } finally {
    await prisma.$disconnect();
  }

  await seedDemoData();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
