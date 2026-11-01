import AxeBuilder from "@axe-core/playwright";
import { test, type Page, type TestInfo } from "@playwright/test";
import { settledPages } from "./settledPages";

/**
 * One pass per settled page. Violations are attached for the HTML report.
 * A WCAG A violation fails the run and names the rule and the element.
 * AA stays in the attachment.
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
  const aViolations = results.violations.filter(
    (violation) => levelOf(violation.tags).rank === 0,
  );
  if (aViolations.length > 0) {
    throw new Error(formatViolations(aViolations));
  }
}

test.describe("Scan the six pages", () => {
  for (const target of settledPages) {
    test(`has no WCAG A violation on ${target.path}`, async ({
      page,
    }, testInfo) => {
      await page.goto(target.path);
      await target.ready(page);
      await publishScan(page, testInfo);
    });
  }
});
