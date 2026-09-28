/**
 * Guard for wiping a database back to the demo seed.
 *
 * `production` is the public Neon branch. Taylor runs that wipe on purpose.
 * `ci` is the GitHub Actions branch, and it only runs when Actions sets CI=true.
 * Any other value, including `local`, throws before a query.
 */
export function assertDatabaseResetAllowed(env: {
  DATABASE_RESET?: string;
  CI?: string;
}): "production" | "ci" {
  if (env.DATABASE_RESET === "production") {
    return "production";
  }
  if (env.DATABASE_RESET === "ci") {
    if (env.CI !== "true") {
      throw new Error(
        "DATABASE_RESET=ci only runs in GitHub Actions. It will not wipe a database from your machine.",
      );
    }
    return "ci";
  }
  throw new Error(
    "Refusing to wipe the database. DATABASE_RESET must be production (public branch) or ci (GitHub Actions only).",
  );
}
