import { type Page } from "@playwright/test";
import { strategyLabels } from "../../src/ui/strategyLabels";

const labels = strategyLabels("POE2");

export function strategyCard(page: Page, name: string) {
  return page.getByRole("listitem").filter({
    has: page.getByRole("heading", { name, exact: true }),
  });
}

export function costPerWaystone(amount: string): string {
  return `${labels.costPer}: ${amount}`;
}

export async function openHome(page: Page): Promise<void> {
  await page.goto("/");
}
