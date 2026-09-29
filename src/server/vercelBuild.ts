/**
 * Pending Prisma migrations apply on the Vercel production build only.
 *
 * Preview, local `npm run build`, and CI do not use this path. CI migrates
 * the Neon `ci` branch in the e2e job. A manual apply is
 * `npm run db:migrate:deploy:production`.
 */
export function shouldMigrateProductionDatabase(
  vercelEnv: string | undefined,
): boolean {
  return vercelEnv === "production";
}
