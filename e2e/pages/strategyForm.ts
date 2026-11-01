import { expect, type Page } from "@playwright/test";
import { strategyLabels } from "../../src/ui/strategyLabels";

const labels = strategyLabels("POE2");

export type StrategyFormInput = {
  name: string;
  game: string;
  description: string;
  mapNotes: string;
  mapCost: string;
  divineRate?: string;
  lines: ReadonlyArray<{
    name: string;
    quantity: string;
    unitCost: string;
    currency?: string;
    modifierNotes?: string;
    uses?: string;
  }>;
};

function addTablet(page: Page) {
  return page.getByRole("button", {
    name: `Add ${labels.enhancementSingular.toLowerCase()}`,
  });
}

export function strategyLine(page: Page, row: number) {
  return page.getByRole("group", {
    name: `${labels.enhancementSingular} name ${row}`,
    exact: true,
  });
}

export async function fillStrategy(
  page: Page,
  strategy: StrategyFormInput,
): Promise<void> {
  await page.getByLabel("Name").fill(strategy.name);
  await page.getByLabel("Game").selectOption({ label: strategy.game });
  await page.getByLabel("Description").fill(strategy.description);
  await page.getByLabel(labels.mapNotes).fill(strategy.mapNotes);
  await page.getByLabel(labels.mapCost).fill(strategy.mapCost);
  if (strategy.divineRate !== undefined) {
    await page
      .getByLabel("Divine rate (chaos per divine)")
      .fill(strategy.divineRate);
  }

  for (const [index, line] of strategy.lines.entries()) {
    const row = index + 1;
    await addTablet(page).click();
    const lineGroup = strategyLine(page, row);
    await lineGroup
      .getByLabel(`${labels.enhancementSingular} name ${row}`, { exact: true })
      .fill(line.name);
    await lineGroup
      .getByLabel("Quantity per map", { exact: true })
      .fill(line.quantity);
    if (line.currency !== undefined) {
      await lineGroup
        .getByLabel("Currency", { exact: true })
        .selectOption({ label: line.currency });
    }
    await lineGroup.getByLabel("Cost", { exact: true }).fill(line.unitCost);
    const uses = lineGroup.getByLabel("Uses", { exact: true });
    await expect(uses).toHaveValue("10");
    if (line.uses !== undefined) {
      await uses.fill(line.uses);
    }
    if (line.modifierNotes !== undefined) {
      await lineGroup
        .getByLabel("Modifier notes", { exact: true })
        .fill(line.modifierNotes);
    }
  }
}

export function waystoneCost(page: Page) {
  return page.getByLabel(labels.mapCost);
}

export function savedCostPerWaystone(page: Page, amount: string) {
  return page.getByText(`${labels.costPer}: ${amount}`);
}

export function saveStrategy(page: Page) {
  return page.getByRole("button", { name: "Save strategy" });
}
