import { assertDatabaseResetAllowed } from "./databaseReset";

describe("assertDatabaseResetAllowed", () => {
  it("allows the public production branch", () => {
    expect(assertDatabaseResetAllowed({ DATABASE_RESET: "production" })).toBe(
      "production",
    );
  });

  it("allows ci only when GitHub Actions set CI=true", () => {
    expect(
      assertDatabaseResetAllowed({ DATABASE_RESET: "ci", CI: "true" }),
    ).toBe("ci");
  });

  it("refuses ci from a machine that is not Actions", () => {
    expect(() => assertDatabaseResetAllowed({ DATABASE_RESET: "ci" })).toThrow(
      /GitHub Actions/,
    );
    expect(() =>
      assertDatabaseResetAllowed({ DATABASE_RESET: "ci", CI: "1" }),
    ).toThrow(/GitHub Actions/);
  });

  it("refuses a missing flag and the local branch", () => {
    expect(() => assertDatabaseResetAllowed({})).toThrow(/Refusing to wipe/);
    expect(() =>
      assertDatabaseResetAllowed({ DATABASE_RESET: "local" }),
    ).toThrow(/Refusing to wipe/);
  });
});
