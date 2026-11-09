export const NOT_AVAILABLE = "Not available";

export const CI_JOB_NAME = "Lint, typecheck, unit, API, build";
export const PLAYWRIGHT_JOB_NAME = "Playwright E2E";
export const VISUAL_JOB_NAME = "Visual baselines";
export const MUTATION_JOB_NAME = "Mutation score";

const MIDNIGHT_LOOKBACK = 20;

export type MutationScoreStep = "success" | "failure" | "skipped" | "absent";

export type WorkflowJob = {
  id: number;
  name: string;
  conclusion: string | null;
};

export type MutationScore = {
  score: string;
  killed: number;
  survived: number;
};

export type WorkflowRun = {
  id: number;
  htmlUrl: string;
  event: string;
  status: string;
  conclusion: string | null;
  createdAt: string;
  headSha?: string;
  jobs?: WorkflowJob[];
  mutationScoreStep?: MutationScoreStep;
  mutationScore?: MutationScore;
};

export type CheckResult =
  | { text: "Passed" | "Failed"; at: string; href: string }
  | { text: typeof NOT_AVAILABLE };

export type MutationResult =
  | { score: string; detail: string; at: string; href: string }
  | { text: typeof NOT_AVAILABLE };

export type LatestResults = {
  ci: CheckResult;
  playwright: CheckResult;
  visual: CheckResult;
  mutation: MutationResult;
};

export function isFinishedRun(run: WorkflowRun): boolean {
  return (
    run.status === "completed" &&
    (run.conclusion === "success" || run.conclusion === "failure") &&
    run.event !== "pull_request"
  );
}

export function formatResultDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function mutationDetail(killed: number, survived: number): string {
  const survivedText =
    survived === 0 ? "None survived." : `${survived} survived.`;
  return `${killed} killed. ${survivedText}`;
}

export function formatMutationScore(total: string): string {
  const value = Number(total);
  if (!Number.isFinite(value)) return total;
  return String(value);
}

export function mutationStatus(description: string): MutationScore | null {
  const match =
    /^score=([0-9]+(?:\.[0-9]+)?) killed=(\d+) survived=(\d+)$/.exec(
      description.trim(),
    );
  if (!match) return null;
  const killed = Number(match[2]);
  const survived = Number(match[3]);
  if (!Number.isInteger(killed) || !Number.isInteger(survived)) return null;
  return {
    score: formatMutationScore(match[1]),
    killed,
    survived,
  };
}

export function mutationSummary(log: string): MutationScore | null {
  const plain = log.replace(/\u001b\[[0-9;]*m/g, "");
  const match =
    /All files\s*\|\s*([0-9]+(?:\.[0-9]+)?)\s*\|\s*[0-9.]+\s*\|\s*(\d+)\s*\|\s*\d+\s*\|\s*(\d+)\s*\|\s*\d+\s*\|\s*\d+\s*\|/.exec(
      plain,
    );
  if (!match) return null;
  const killed = Number(match[2]);
  const survived = Number(match[3]);
  if (!Number.isInteger(killed) || !Number.isInteger(survived)) return null;
  return {
    score: formatMutationScore(match[1]),
    killed,
    survived,
  };
}

function byNewest(a: WorkflowRun, b: WorkflowRun): number {
  if (a.createdAt === b.createdAt) return 0;
  return a.createdAt < b.createdAt ? 1 : -1;
}

function latestFinished(runs: WorkflowRun[]): WorkflowRun | undefined {
  return runs.filter(isFinishedRun).sort(byNewest)[0];
}

function jobResult(
  run: WorkflowRun | undefined,
  jobName: string,
): CheckResult {
  if (!run?.jobs) return { text: NOT_AVAILABLE };
  const job = run.jobs.find((item) => item.name === jobName);
  if (!job || (job.conclusion !== "success" && job.conclusion !== "failure")) {
    return { text: NOT_AVAILABLE };
  }
  return {
    text: job.conclusion === "success" ? "Passed" : "Failed",
    at: run.createdAt,
    href: run.htmlUrl,
  };
}

function latestMutation(runs: WorkflowRun[]): MutationResult {
  const match = runs
    .filter(isFinishedRun)
    .sort(byNewest)
    .slice(0, MIDNIGHT_LOOKBACK)
    .find(
      (run) =>
        run.mutationScoreStep === "success" ||
        run.mutationScoreStep === "failure",
    );
  if (!match?.mutationScore) return { text: NOT_AVAILABLE };
  return {
    score: match.mutationScore.score,
    detail: mutationDetail(
      match.mutationScore.killed,
      match.mutationScore.survived,
    ),
    at: match.createdAt,
    href: match.htmlUrl,
  };
}

export function latestResults(input: {
  ciRuns: WorkflowRun[];
  midnightRuns: WorkflowRun[];
  mutationReadable?: boolean;
}): LatestResults {
  const ciRun = latestFinished(input.ciRuns);
  const visualRun = latestFinished(input.midnightRuns);
  const mutationReadable = input.mutationReadable !== false;
  return {
    ci: jobResult(ciRun, CI_JOB_NAME),
    playwright: jobResult(ciRun, PLAYWRIGHT_JOB_NAME),
    visual: jobResult(visualRun, VISUAL_JOB_NAME),
    mutation: mutationReadable
      ? latestMutation(input.midnightRuns)
      : { text: NOT_AVAILABLE },
  };
}
