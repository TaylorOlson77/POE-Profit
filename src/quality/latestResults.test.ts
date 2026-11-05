import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  CI_JOB_NAME,
  NOT_AVAILABLE,
  PLAYWRIGHT_JOB_NAME,
  VISUAL_JOB_NAME,
  formatMutationScore,
  formatResultDate,
  latestResults,
  mutationStatus,
  mutationSummary,
  type MutationScore,
  type WorkflowJob,
  type WorkflowRun,
} from "./latestResults";

const SCORE_LINE =
  "All files | 100.00 |  100.00 |       84 |         0 |          0 |        0 |        0 |";

function job(name: string, conclusion: string | null = "success"): WorkflowJob {
  return { id: 1, name, conclusion };
}

function run(
  overrides: Pick<WorkflowRun, "createdAt"> & Partial<WorkflowRun>,
): WorkflowRun {
  return {
    id: 1,
    event: "push",
    status: "completed",
    conclusion: "success",
    jobs: [job(CI_JOB_NAME), job(PLAYWRIGHT_JOB_NAME)],
    ...overrides,
  };
}

function night(
  overrides: Pick<WorkflowRun, "createdAt"> & Partial<WorkflowRun>,
): WorkflowRun {
  return run({
    event: "schedule",
    jobs: [job(VISUAL_JOB_NAME)],
    ...overrides,
  });
}

function scored(
  createdAt: string,
  score: MutationScore,
  step: "success" | "failure" = "success",
): WorkflowRun {
  return night({
    createdAt,
    mutationScoreStep: step,
    mutationScore: score,
  });
}

describe("latestResults", () => {
  it("marks a finished run Passed or Failed", () => {
    const results = latestResults({
      ciRuns: [
        run({
          createdAt: "2026-11-01T00:00:00Z",
          jobs: [
            job(CI_JOB_NAME, "failure"),
            job(PLAYWRIGHT_JOB_NAME, "success"),
          ],
        }),
        run({ createdAt: "2026-11-05T00:00:00Z" }),
      ],
      midnightRuns: [
        night({ createdAt: "2026-11-03T05:00:00Z" }),
        night({
          createdAt: "2026-11-04T05:00:00Z",
          jobs: [job(VISUAL_JOB_NAME, "failure")],
        }),
      ],
    });

    expect(results.ci).toEqual({
      text: "Passed",
      at: "2026-11-05T00:00:00Z",
    });
    expect(results.playwright).toEqual({
      text: "Passed",
      at: "2026-11-05T00:00:00Z",
    });
    expect(results.visual).toEqual({
      text: "Failed",
      at: "2026-11-04T05:00:00Z",
    });
    expect(formatResultDate("2026-11-01T23:19:56Z")).toBe("Nov 1");
    expect(results.ci).not.toHaveProperty("href");
  });

  it("keeps a failed Playwright job off the CI row", () => {
    const results = latestResults({
      ciRuns: [
        run({
          createdAt: "2026-11-05T00:00:00Z",
          jobs: [
            job(CI_JOB_NAME, "success"),
            job(PLAYWRIGHT_JOB_NAME, "failure"),
          ],
        }),
      ],
      midnightRuns: [],
    });

    expect(results.ci).toEqual({
      text: "Passed",
      at: "2026-11-05T00:00:00Z",
    });
    expect(results.playwright).toEqual({
      text: "Failed",
      at: "2026-11-05T00:00:00Z",
    });
  });

  it("skips a pull request run", () => {
    const results = latestResults({
      ciRuns: [
        run({ createdAt: "2026-11-01T00:00:00Z" }),
        run({
          createdAt: "2026-11-05T00:00:00Z",
          event: "pull_request",
          jobs: [job(CI_JOB_NAME, "failure"), job(PLAYWRIGHT_JOB_NAME)],
        }),
      ],
      midnightRuns: [],
    });

    expect(results.ci).toEqual({
      text: "Passed",
      at: "2026-11-01T00:00:00Z",
    });
  });

  it("skips a run that is still in progress", () => {
    const results = latestResults({
      ciRuns: [
        run({ createdAt: "2026-11-01T00:00:00Z" }),
        run({
          createdAt: "2026-11-05T00:00:00Z",
          status: "in_progress",
          conclusion: null,
          jobs: [job(CI_JOB_NAME, "failure")],
        }),
      ],
      midnightRuns: [],
    });

    expect(results.ci).toEqual({
      text: "Passed",
      at: "2026-11-01T00:00:00Z",
    });
  });

  it("skips a cancelled run", () => {
    const results = latestResults({
      ciRuns: [
        run({ createdAt: "2026-11-01T00:00:00Z" }),
        run({
          createdAt: "2026-11-05T00:00:00Z",
          conclusion: "cancelled",
        }),
      ],
      midnightRuns: [
        night({ createdAt: "2026-11-03T05:00:00Z" }),
        night({
          createdAt: "2026-11-04T05:00:00Z",
          conclusion: "cancelled",
        }),
      ],
    });

    expect(results.ci).toEqual({
      text: "Passed",
      at: "2026-11-01T00:00:00Z",
    });
    expect(results.visual).toEqual({
      text: "Passed",
      at: "2026-11-03T05:00:00Z",
    });
  });

  it("shows the mutation score from the run that scored", () => {
    const summary = mutationSummary(SCORE_LINE);
    expect(summary).toEqual({ score: "100", killed: 84, survived: 0 });
    expect(mutationStatus("score=100 killed=84 survived=0")).toEqual(summary);
    const dir = mkdtempSync(path.join(tmpdir(), "mutation-"));
    const logPath = path.join(dir, "log.txt");
    writeFileSync(logPath, SCORE_LINE);
    expect(
      execFileSync(
        process.execPath,
        ["scripts/read-mutation-log.mjs", logPath],
        { encoding: "utf8" },
      ),
    ).toBe("score=100\nkilled=84\nsurvived=0\n");

    const results = latestResults({
      ciRuns: [],
      midnightRuns: [
        scored("2026-11-01T05:00:00Z", summary!),
        night({
          createdAt: "2026-11-04T05:00:00Z",
          mutationScoreStep: "skipped",
        }),
      ],
    });

    expect(results.mutation).toEqual({
      score: "100",
      detail: "84 killed. None survived.",
      at: "2026-11-01T05:00:00Z",
    });
    expect(results.visual).toEqual({
      text: "Passed",
      at: "2026-11-04T05:00:00Z",
    });
  });

  it("shows a newer scored dispatch, including a score under the break", () => {
    const results = latestResults({
      ciRuns: [],
      midnightRuns: [
        scored("2026-11-01T05:00:00Z", {
          score: "100",
          killed: 84,
          survived: 0,
        }),
        scored(
          "2026-11-03T12:00:00Z",
          { score: formatMutationScore("92.50"), killed: 80, survived: 2 },
          "failure",
        ),
      ],
    });

    expect(results.mutation).toEqual({
      score: "92.5",
      detail: "80 killed. 2 survived.",
      at: "2026-11-03T12:00:00Z",
    });
  });

  it("ignores a scored run older than the latest 20 completed midnight runs", () => {
    const midnightRuns = Array.from({ length: 21 }, (_, index) =>
      night({
        createdAt: `2026-10-${String(index + 1).padStart(2, "0")}T05:00:00Z`,
        mutationScoreStep: index === 0 ? "success" : "skipped",
        mutationScore:
          index === 0 ? { score: "100", killed: 84, survived: 0 } : undefined,
      }),
    );

    const outside = latestResults({ ciRuns: [], midnightRuns });
    expect(outside.mutation).toEqual({ text: NOT_AVAILABLE });

    const inside = latestResults({
      ciRuns: [],
      midnightRuns: midnightRuns.map((item, index) =>
        index === 1
          ? {
              ...item,
              mutationScoreStep: "success" as const,
              mutationScore: { score: "100", killed: 84, survived: 0 },
            }
          : item,
      ),
    });
    expect(inside.mutation).toEqual({
      score: "100",
      detail: "84 killed. None survived.",
      at: "2026-10-02T05:00:00Z",
    });
  });

  it("says a missing run is not available", () => {
    const results = latestResults({ ciRuns: [], midnightRuns: [] });

    expect(results.ci).toEqual({ text: NOT_AVAILABLE });
    expect(results.playwright).toEqual({ text: NOT_AVAILABLE });
    expect(results.visual).toEqual({ text: NOT_AVAILABLE });
    expect(results.mutation).toEqual({ text: NOT_AVAILABLE });
    expect(results.ci).not.toHaveProperty("href");
    expect(results).not.toHaveProperty("counts");
  });

  it("says a finished run is not available when its jobs were not read", () => {
    const results = latestResults({
      ciRuns: [run({ createdAt: "2026-11-05T00:00:00Z", jobs: undefined })],
      midnightRuns: [
        night({ createdAt: "2026-11-04T05:00:00Z", jobs: undefined }),
      ],
    });

    expect(results.ci).toEqual({ text: NOT_AVAILABLE });
    expect(results.playwright).toEqual({ text: NOT_AVAILABLE });
    expect(results.visual).toEqual({ text: NOT_AVAILABLE });
  });

  it("says mutation is not available when the score step cannot be read", () => {
    const results = latestResults({
      ciRuns: [],
      midnightRuns: [
        scored("2026-11-01T05:00:00Z", {
          score: "100",
          killed: 84,
          survived: 0,
        }),
      ],
      mutationReadable: false,
    });

    expect(results.visual).toEqual({
      text: "Passed",
      at: "2026-11-01T05:00:00Z",
    });
    expect(results.mutation).toEqual({ text: NOT_AVAILABLE });
  });

  it("says mutation is not available when the step ran but the score was not read", () => {
    const results = latestResults({
      ciRuns: [],
      midnightRuns: [
        night({
          createdAt: "2026-11-05T08:11:29Z",
          mutationScoreStep: "success",
        }),
      ],
    });

    expect(results.mutation).toEqual({ text: NOT_AVAILABLE });
    expect(mutationSummary("no table here")).toBeNull();
  });
});
