import { expect, test } from "@playwright/test";
import { installUiTestCleanup } from "./dbCleanup";
import { crudStrategy, strategyWithSessions } from "./fixtures";
import { costPerWaystone, openHome, strategyCard } from "./pages/home";
import {
  fillStrategy,
  savedCostPerWaystone,
  saveStrategy,
  waystoneCost,
} from "./pages/strategyForm";

const CONFLICT_MESSAGE = "Cannot delete a strategy that still has map sessions";

test.describe("Create, update, and delete a strategy", () => {
  test.describe.configure({ mode: "serial" });
  installUiTestCleanup([{ name: crudStrategy.name }]);

  test("shows the new strategy on the home list with its cost per waystone", async ({
    page,
  }) => {
    await openHome(page);
    await page.getByRole("link", { name: "New strategy" }).click();
    await fillStrategy(page, crudStrategy);
    await saveStrategy(page).click();

    await expect(page).toHaveURL("/");
    const card = strategyCard(page, crudStrategy.name);
    await expect(card).toContainText(crudStrategy.game);
    await expect(card).toContainText(costPerWaystone("23c"));
  });

  test("shows the updated cost per waystone on the home list", async ({
    page,
  }) => {
    await openHome(page);
    await strategyCard(page, crudStrategy.name)
      .getByRole("link", { name: `Edit ${crudStrategy.name}` })
      .click();

    await expect(waystoneCost(page)).toHaveValue(crudStrategy.mapCost);
    await expect(page.getByLabel("Uses 1")).toHaveValue("10");
    await expect(page.getByLabel("Uses 2")).toHaveValue("10");
    await expect(savedCostPerWaystone(page, "23c")).toBeVisible();

    await waystoneCost(page).fill("3");
    await expect(savedCostPerWaystone(page, "23c")).toBeVisible();

    await saveStrategy(page).click();
    await expect(page.getByRole("status")).toHaveText("Saved.");
    await expect(savedCostPerWaystone(page, "24c")).toBeVisible();

    await page.getByRole("link", { name: "Strategies" }).click();
    await expect(strategyCard(page, crudStrategy.name)).toContainText(
      costPerWaystone("24c"),
    );
  });

  test("removes the strategy from the home list only after delete is confirmed", async ({
    page,
  }) => {
    await openHome(page);
    const card = strategyCard(page, crudStrategy.name);

    await card
      .getByRole("button", { name: `Delete ${crudStrategy.name}` })
      .click();
    await expect(card.getByText(`Delete ${crudStrategy.name}?`)).toBeVisible();

    await card.getByRole("button", { name: "Cancel" }).click();
    await expect(
      card.getByRole("heading", { name: crudStrategy.name }),
    ).toBeVisible();

    await card
      .getByRole("button", { name: `Delete ${crudStrategy.name}` })
      .click();
    await card.getByRole("button", { name: "Confirm delete" }).click();
    await expect(
      page.getByRole("heading", { name: crudStrategy.name, exact: true }),
    ).toHaveCount(0);
  });
});

test.describe("Delete a strategy that still has sessions", () => {
  installUiTestCleanup([strategyWithSessions]);

  test("shows the conflict message when a strategy still has sessions", async ({
    page,
  }) => {
    await openHome(page);
    const card = strategyCard(page, strategyWithSessions.name);

    await card
      .getByRole("button", { name: `Delete ${strategyWithSessions.name}` })
      .click();
    await expect(
      card.getByText(`Delete ${strategyWithSessions.name}?`),
    ).toBeVisible();

    await card.getByRole("button", { name: "Confirm delete" }).click();
    await expect(page.getByText(CONFLICT_MESSAGE)).toBeVisible();
    await expect(
      card.getByRole("heading", { name: strategyWithSessions.name }),
    ).toBeVisible();
  });
});
