import { spawnSync } from "node:child_process";

import { generatePrismaClient } from "../src/server/prismaGenerate";
import { shouldMigrateProductionDatabase } from "../src/server/vercelBuild";

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (shouldMigrateProductionDatabase(process.env.VERCEL_ENV)) {
  run("npx", ["prisma", "migrate", "deploy"]);
}

generatePrismaClient();
run("npx", ["next", "build"]);
