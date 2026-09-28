import { type Page } from "@playwright/test";
import { strategyLabels } from "../../src/ui/strategyLabels";

const labels = strategyLabels("POE2");

export type SessionFormInput = {
  mapsCompleted: string;
  mapCost: string;
  divineRate: string;
  sampleMaps: string;
  sampleMinutes: string;
  investment: ReadonlyArray<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  revenue: ReadonlyArray<{
    category: string;
    name: string;
    quantity: string;
    unit: string;
  }>;
};

export function waystoneCost(page: Page) {
  return page.getByLabel(labels.mapCost);
}

export function durationMethod(page: Page) {
  return page.getByLabel("Method");
}

export async function fillSession(
  page: Page,
  session: SessionFormInput,
): Promise<void> {
  await page
    .getByLabel(`${labels.mapsNoun} completed`)
    .fill(session.mapsCompleted);
  await waystoneCost(page).fill(session.mapCost);
  await page
    .getByLabel("Divine rate (chaos per divine)")
    .fill(session.divineRate);
  await page
    .getByLabel(`Sample ${labels.mapsNoun.toLowerCase()}`)
    .fill(session.sampleMaps);
  await page.getByLabel("Sample minutes").fill(session.sampleMinutes);

  for (const [index, line] of session.investment.entries()) {
    const row = index + 1;
    if (row > 1) {
      await page.getByRole("button", { name: "Add investment" }).click();
    }
    await page.getByLabel(`Investment item ${row}`).fill(line.name);
    await page.getByLabel(`Investment quantity ${row}`).fill(line.quantity);
    await page.getByLabel(`Investment unit value ${row}`).fill(line.unit);
  }

  for (const [index, line] of session.revenue.entries()) {
    const row = index + 1;
    if (row > 1) {
      await page.getByRole("button", { name: "Add revenue" }).click();
    }
    await page
      .getByLabel(`Revenue category ${row}`)
      .selectOption(line.category);
    await page.getByLabel(`Revenue item ${row}`).fill(line.name);
    await page.getByLabel(`Revenue quantity ${row}`).fill(line.quantity);
    await page.getByLabel(`Revenue unit value ${row}`).fill(line.unit);
  }
}

export function saveSession(page: Page) {
  return page.getByRole("button", { name: "Save session" });
}

export function revenueQuantity(page: Page, row: number) {
  return page.getByLabel(`Revenue quantity ${row}`);
}

export function revenueRow(page: Page, row: number) {
  return page.getByRole("row").filter({
    has: page.getByLabel(`Revenue item ${row}`),
  });
}

/** The Performance value named by its term. Exact, so "Profit" is not "Profit / hour". */
export function performanceValue(page: Page, term: string) {
  return page
    .getByRole("group", { name: term, exact: true })
    .getByRole("definition");
}
