import { z } from "zod";
import { isForeignKeyRestrictError, zodErrorDetails } from "./apiError";

describe("isForeignKeyRestrictError", () => {
  it("matches Prisma restrict codes", () => {
    expect(isForeignKeyRestrictError({ code: "P2003" })).toBe(true);
    expect(isForeignKeyRestrictError({ code: "P2014" })).toBe(true);
    expect(isForeignKeyRestrictError({ code: "P2025" })).toBe(false);
    expect(isForeignKeyRestrictError(new Error("nope"))).toBe(false);
  });

  it("matches the unmapped Postgres restrict error", () => {
    expect(
      isForeignKeyRestrictError(
        new Error(
          'PostgresError { code: "23001", message: "violates RESTRICT setting of foreign key constraint \\"MapSession_strategyId_fkey\\"" }',
        ),
      ),
    ).toBe(true);
  });
});

describe("zodErrorDetails", () => {
  it("joins the issue path for the API details array", () => {
    const parsed = z
      .object({
        enhancementLines: z.array(
          z.object({
            quantity: z
              .string()
              .regex(/^\d+$/, "Must be a non-negative decimal string"),
          }),
        ),
      })
      .safeParse({ enhancementLines: [{ quantity: "nope" }] });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(zodErrorDetails(parsed.error)).toEqual([
        {
          path: "enhancementLines.0.quantity",
          message: "Must be a non-negative decimal string",
        },
      ]);
    }
  });
});
