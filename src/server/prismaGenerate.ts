import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";

/**
 * `prisma generate` rewrites the query engine on every run. On Windows,
 * `next dev` keeps that file open, and the rewrite fails with EPERM. The
 * engine binary is the same until Prisma itself is upgraded, so the copy
 * already on disk is enough for this build.
 */
export function lockedQueryEngineCanStay(
  status: number | null,
  output: string,
  engineExists: boolean,
): boolean {
  if (status === 0 || !engineExists) {
    return false;
  }
  return output.includes("EPERM") && output.includes("query_engine");
}

function queryEnginePresent(): boolean {
  try {
    return readdirSync("node_modules/.prisma/client").some(
      (name) =>
        name.startsWith("query_engine") || name.startsWith("libquery_engine"),
    );
  } catch {
    return false;
  }
}

export function generatePrismaClient(): void {
  const result = spawnSync("npx prisma generate", {
    encoding: "utf8",
    shell: true,
  });
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (lockedQueryEngineCanStay(result.status, output, queryEnginePresent())) {
    console.warn(
      "Prisma could not replace the query engine because another process has it open. The existing engine is still in place, so the build will continue. Stop `npm run dev` and run `npm run db:generate` after a Prisma upgrade.",
    );
    return;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
