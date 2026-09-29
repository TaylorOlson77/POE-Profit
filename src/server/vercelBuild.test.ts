import { shouldMigrateProductionDatabase } from "./vercelBuild";

describe("shouldMigrateProductionDatabase", () => {
  it("applies migrations on the Vercel production build", () => {
    expect(shouldMigrateProductionDatabase("production")).toBe(true);
  });

  it("skips preview, development, and a build with no Vercel environment", () => {
    expect(shouldMigrateProductionDatabase("preview")).toBe(false);
    expect(shouldMigrateProductionDatabase("development")).toBe(false);
    expect(shouldMigrateProductionDatabase(undefined)).toBe(false);
    expect(shouldMigrateProductionDatabase("")).toBe(false);
  });
});
