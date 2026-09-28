import { type Page } from "@playwright/test";

export function deleteSession(
  page: Page,
  strategyName: string,
  profit: string,
) {
  return page.getByRole("button", {
    name: `Delete session for ${strategyName}, profit ${profit}`,
  });
}

export async function openHistory(page: Page): Promise<void> {
  await page.goto("/sessions");
}
