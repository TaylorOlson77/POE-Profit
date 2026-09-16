import {
  DecimalStringSchema,
  SignedDecimalStringSchema,
} from "./decimal";

describe("DecimalStringSchema", () => {
  it("accepts non-negative decimal strings", () => {
    expect(DecimalStringSchema.safeParse("0").success).toBe(true);
    expect(DecimalStringSchema.safeParse("10").success).toBe(true);
    expect(DecimalStringSchema.safeParse("0.20").success).toBe(true);
  });

  it("rejects negatives and JSON numbers", () => {
    expect(DecimalStringSchema.safeParse("-50").success).toBe(false);
    expect(DecimalStringSchema.safeParse(50).success).toBe(false);
  });
});

describe("SignedDecimalStringSchema", () => {
  it("accepts positive, zero, and negative decimal strings", () => {
    expect(SignedDecimalStringSchema.safeParse("50").success).toBe(true);
    expect(SignedDecimalStringSchema.safeParse("0").success).toBe(true);
    expect(SignedDecimalStringSchema.safeParse("-50").success).toBe(true);
  });

  it("rejects JSON numbers", () => {
    expect(SignedDecimalStringSchema.safeParse(-50).success).toBe(false);
  });
});
