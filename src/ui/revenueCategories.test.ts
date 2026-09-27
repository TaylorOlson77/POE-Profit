import { categoryOptions, REVENUE_CATEGORIES } from "./revenueCategories";

describe("categoryOptions", () => {
  it("returns the seed list for a known category", () => {
    expect(categoryOptions("Currency")).toEqual([...REVENUE_CATEGORIES]);
  });

  it("keeps a stored category that is not in the seed list", () => {
    expect(categoryOptions("Uniques")).toEqual([
      "Uniques",
      ...REVENUE_CATEGORIES,
    ]);
  });
});
