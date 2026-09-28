import { expect, test } from "@playwright/test";
import { installUiTestCleanup } from "./dbCleanup";
import { extrapolatedSession, strategyWithSessions } from "./fixtures";
import {
  durationMethod,
  fillSession,
  performanceValue,
  revenueQuantity,
  revenueRow,
  saveSession,
  waystoneCost,
} from "./pages/sessionForm";
import { deleteSession, openHistory } from "./pages/sessionHistory";

let sessionPath = "";

test.describe("Create, update, and delete a session", () => {
  test.describe.configure({ mode: "serial" });
  installUiTestCleanup([strategyWithSessions]);

  test("shows the saved performance totals for an extrapolated session", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("link", {
        name: `Log session for ${extrapolatedSession.strategyName}`,
      })
      .click();

    await expect(waystoneCost(page)).toHaveValue(extrapolatedSession.mapCost);
    await expect(durationMethod(page).locator("option:checked")).toHaveText(
      "Extrapolated",
    );

    await fillSession(page, extrapolatedSession);
    await saveSession(page).click();

    await expect(page).toHaveURL(/\/sessions\/(?!new(?:$|[?#]))[^/?#]+$/);
    sessionPath = new URL(page.url()).pathname;

    await expect(page.getByText("Waystone investment: 80c")).toBeVisible();
    await expect(performanceValue(page, "Duration method")).toHaveText(
      "Extrapolated",
    );
    await expect(performanceValue(page, "Effective duration")).toHaveText(
      "1h 20m (80 min)",
    );
    await expect(performanceValue(page, "Total revenue")).toHaveText("2120c");
    await expect(performanceValue(page, "Total investment")).toHaveText("400c");
    await expect(performanceValue(page, "Profit")).toHaveText("1720c");
    await expect(performanceValue(page, "Profit (divine)")).toHaveText(
      "≈ 8.6 Divine",
    );
    await expect(performanceValue(page, "Profit / hour")).toHaveText("1290c");
    await expect(performanceValue(page, "Profit / waystone")).toHaveText("43c");
    await expect(performanceValue(page, "Waystones / hour")).toHaveText("30");
    await expect(performanceValue(page, "ROI")).toHaveText("430%");
  });

  test("shows the new totals after a saved quantity change", async ({
    page,
  }) => {
    await page.goto(sessionPath);

    await revenueQuantity(page, 1).fill("9");
    await expect(
      page.getByText("Unsaved changes. Totals below are from the last save."),
    ).toBeVisible();
    await expect(performanceValue(page, "Total revenue")).toHaveText("2120c");
    await expect(performanceValue(page, "Profit")).toHaveText("1720c");

    await saveSession(page).click();
    await expect(page.getByRole("status")).toHaveText("Saved.");

    await expect(revenueRow(page, 1)).toContainText("1800c");
    await expect(performanceValue(page, "Duration method")).toHaveText(
      "Extrapolated",
    );
    await expect(performanceValue(page, "Effective duration")).toHaveText(
      "1h 20m (80 min)",
    );
    await expect(performanceValue(page, "Total revenue")).toHaveText("2520c");
    await expect(performanceValue(page, "Total investment")).toHaveText("400c");
    await expect(performanceValue(page, "Profit")).toHaveText("2120c");
    await expect(performanceValue(page, "Profit (divine)")).toHaveText(
      "≈ 10.6 Divine",
    );
    await expect(performanceValue(page, "Profit / hour")).toHaveText("1590c");
    await expect(performanceValue(page, "Profit / waystone")).toHaveText("53c");
    await expect(performanceValue(page, "Waystones / hour")).toHaveText("30");
    await expect(performanceValue(page, "ROI")).toHaveText("530%");
  });

  test("removes the session from history only after delete is confirmed", async ({
    page,
  }) => {
    await openHistory(page);
    const rowDelete = deleteSession(page, strategyWithSessions.name, "2120c");

    await rowDelete.click();
    await expect(page.getByText("Delete this session?")).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(rowDelete).toBeVisible();

    await rowDelete.click();
    await page.getByRole("button", { name: "Confirm delete" }).click();
    await expect(rowDelete).toHaveCount(0);
    await expect(
      deleteSession(page, strategyWithSessions.name, "1920c"),
    ).toBeVisible();
  });
});
