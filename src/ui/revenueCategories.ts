/** Seed list from MVP_SPEC §10. Stored categories outside this list stay selectable on edit. */
export const REVENUE_CATEGORIES = [
  "Currency",
  "Tablets",
  "Oils",
  "Waystones",
  "Invitations",
  "Fragments",
  "Divination Cards",
  "Essences",
  "Fossils",
  "Other",
] as const;

export const DEFAULT_REVENUE_CATEGORY: (typeof REVENUE_CATEGORIES)[number] =
  "Currency";

export function categoryOptions(current: string): string[] {
  const trimmed = current.trim();
  if (
    trimmed !== "" &&
    !REVENUE_CATEGORIES.includes(trimmed as (typeof REVENUE_CATEGORIES)[number])
  ) {
    return [trimmed, ...REVENUE_CATEGORIES];
  }
  return [...REVENUE_CATEGORIES];
}
