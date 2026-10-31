import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

/**
 * One pass per settled page. Violations are attached for the HTML report.
 * They do not fail the run. A later ticket makes a WCAG A violation fail.
 */

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const A_TAGS = new Set(["wcag2a", "wcag21a"]);
const LEVEL_TAGS = new Set([
  "wcag2a",
  "wcag21a",
  "wcag2aa",
  "wcag21aa",
  "wcag22aa",
]);

const DEMO_STRATEGY = "Expedition + Temple tablets (demo)";
const STRATEGY_PATH = "/strategies/seed_strategy_poe2_expedition";
const SESSION_PATH = "/sessions/seed_map_session_poe2_expedition";

type ScanResults = Awaited<ReturnType<AxeBuilder["analyze"]>>;
type Violation = ScanResults["violations"][number];

function levelOf(tags: string[]): { rank: number; label: string } {
  const matched = tags.filter((tag) => LEVEL_TAGS.has(tag));
  const rank = matched.some((tag) => A_TAGS.has(tag)) ? 0 : 1;
  const name = rank === 0 ? "A" : "AA";
  return { rank, label: `${name} (${matched.join(", ")})` };
}

function formatTarget(target: Violation["nodes"][number]["target"]): string {
  return target
    .map((part) => (typeof part === "string" ? part : part.join(" ")))
    .join(" ");
}

function formatViolations(violations: Violation[]): string {
  if (violations.length === 0) {
    return "No violations.\n";
  }

  const sorted = [...violations].sort((left, right) => {
    const byLevel = levelOf(left.tags).rank - levelOf(right.tags).rank;
    if (byLevel !== 0) {
      return byLevel;
    }
    return left.id.localeCompare(right.id);
  });

  const blocks = sorted.map((violation) => {
    const nodes = violation.nodes
      .map((node) => {
        const html = node.html.replace(/\s+/g, " ").trim();
        return `  ${formatTarget(node.target)}\n  ${html}`;
      })
      .join("\n");
    return `${levelOf(violation.tags).label}\n${violation.id}\n${nodes}`;
  });

  return `${blocks.join("\n\n")}\n`;
}

async function publishScan(page: Page, testInfo: TestInfo): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  await testInfo.attach("axe", {
    body: formatViolations(results.violations),
    contentType: "text/plain",
  });
}

test.describe("Scan the six pages", () => {
  test("publishes the axe violations for /", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByText(DEMO_STRATEGY)).toBeVisible();
    await publishScan(page, testInfo);
  });

  test("publishes the axe violations for /strategies/new", async ({
    page,
  }, testInfo) => {
    await page.goto("/strategies/new");
    await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    await publishScan(page, testInfo);
  });

  test("publishes the axe violations for /strategies/[id]", async ({
    page,
  }, testInfo) => {
    await page.goto(STRATEGY_PATH);
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
      DEMO_STRATEGY,
    );
    await publishScan(page, testInfo);
  });

  test("publishes the axe violations for /sessions", async ({
    page,
  }, testInfo) => {
    await page.goto("/sessions");
    await expect(
      page.getByRole("table", { name: "Map session history" }),
    ).toBeVisible();
    await publishScan(page, testInfo);
  });

  test("publishes the axe violations for /sessions/new", async ({
    page,
  }, testInfo) => {
    await page.goto("/sessions/new");
    await expect(page.getByLabel("Waystones completed")).toBeVisible();
    await publishScan(page, testInfo);
  });

  test("publishes the axe violations for /sessions/[id]", async ({
    page,
  }, testInfo) => {
    await page.goto(SESSION_PATH);
    await expect(page.getByLabel("Waystones completed")).toHaveValue("40");
    await publishScan(page, testInfo);
  });
});
