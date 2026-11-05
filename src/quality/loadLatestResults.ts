import { readFile } from "node:fs/promises";
import { connection } from "next/server";
import {
  MUTATION_JOB_NAME,
  isFinishedRun,
  latestResults,
  mutationStatus,
  type LatestResults,
  type MutationScoreStep,
  type WorkflowJob,
  type WorkflowRun,
} from "./latestResults";

const REPO = "TaylorOlson77/POE-Profit";
const CACHE_MS = 5 * 60 * 1000;
const MIDNIGHT_LOOKBACK = 20;

const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "poe-profit",
};

let cache: { expires: number; results: LatestResults } | undefined;

export async function loadLatestResults(): Promise<LatestResults> {
  await connection();
  const fixturePath = process.env.QUALITY_RESULTS_FIXTURE;
  if (fixturePath) return readFixture(fixturePath);

  const now = Date.now();
  if (cache && cache.expires > now) return cache.results;

  const results = await fetchLatest();
  cache = { expires: now + CACHE_MS, results };
  return results;
}

async function readFixture(fixturePath: string): Promise<LatestResults> {
  const parsed: unknown = JSON.parse(await readFile(fixturePath, "utf8"));
  if (!isFixture(parsed)) {
    throw new Error(
      "QUALITY_RESULTS_FIXTURE must be a JSON file of CI, Playwright, visual, and mutation results",
    );
  }
  return parsed;
}

function isFixture(value: unknown): value is LatestResults {
  if (!isRecord(value)) return false;
  return (
    isCheck(value.ci) &&
    isCheck(value.playwright) &&
    isCheck(value.visual) &&
    isMutation(value.mutation)
  );
}

function isCheck(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (value.text === "Not available") return true;
  return (
    (value.text === "Passed" || value.text === "Failed") &&
    typeof value.at === "string"
  );
}

function isMutation(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (value.text === "Not available") return true;
  return (
    typeof value.score === "string" &&
    typeof value.detail === "string" &&
    typeof value.at === "string"
  );
}

async function fetchLatest(): Promise<LatestResults> {
  const [ciRuns, midnightRuns] = await Promise.all([
    fetchCompletedRuns("ci.yml"),
    fetchCompletedRuns("midnight.yml"),
  ]);
  const preparedCi = await attachCiJobs(ciRuns ?? []);
  if (midnightRuns === null) {
    return latestResults({
      ciRuns: preparedCi,
      midnightRuns: [],
      mutationReadable: false,
    });
  }
  const scored = await attachMidnight(midnightRuns);
  return latestResults({
    ciRuns: preparedCi,
    midnightRuns: scored.runs,
    mutationReadable: scored.mutationReadable,
  });
}

async function attachCiJobs(runs: WorkflowRun[]): Promise<WorkflowRun[]> {
  const latest = runs
    .filter(isFinishedRun)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  if (!latest) return runs;
  const jobs = await fetchJobs(latest.id);
  if (!jobs) return runs;
  return runs.map((run) => (run.id === latest.id ? { ...run, jobs } : run));
}

async function fetchCompletedRuns(
  workflow: "ci.yml" | "midnight.yml",
): Promise<WorkflowRun[] | null> {
  const params = new URLSearchParams({
    branch: "main",
    status: "completed",
    per_page: "20",
  });
  const url = `https://api.github.com/repos/${REPO}/actions/workflows/${workflow}/runs?${params}`;
  try {
    const response = await fetch(url, {
      headers: GITHUB_HEADERS,
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return parseRuns(await response.json());
  } catch {
    return null;
  }
}

function parseRuns(body: unknown): WorkflowRun[] | null {
  if (!isRecord(body) || !Array.isArray(body.workflow_runs)) return null;
  const runs: WorkflowRun[] = [];
  for (const run of body.workflow_runs) {
    if (!isRecord(run)) return null;
    if (typeof run.id !== "number") return null;
    if (typeof run.event !== "string") return null;
    if (typeof run.status !== "string") return null;
    if (run.conclusion !== null && typeof run.conclusion !== "string") {
      return null;
    }
    if (typeof run.created_at !== "string") return null;
    if (typeof run.head_sha !== "string") return null;
    runs.push({
      id: run.id,
      event: run.event,
      status: run.status,
      conclusion: run.conclusion,
      createdAt: run.created_at,
      headSha: run.head_sha,
    });
  }
  return runs;
}

async function attachMidnight(runs: WorkflowRun[]): Promise<{
  runs: WorkflowRun[];
  mutationReadable: boolean;
}> {
  const ordered = runs
    .filter(isFinishedRun)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, MIDNIGHT_LOOKBACK);
  const inspected: WorkflowRun[] = [];
  let mutationReadable = true;
  for (const run of ordered) {
    const jobs = await fetchJobs(run.id);
    if (!jobs) {
      mutationReadable = false;
      inspected.push(run);
      break;
    }
    const step = mutationStep(jobs);
    if (step === "success" || step === "failure") {
      inspected.push({
        ...run,
        jobs,
        mutationScoreStep: step,
        mutationScore: await readMutationScore(run),
      });
      break;
    }
    inspected.push({ ...run, jobs, mutationScoreStep: step });
  }
  return { runs: inspected, mutationReadable };
}

async function readMutationScore(run: WorkflowRun) {
  if (!run.headSha) return undefined;
  const description = await fetchMutationStatus(run.headSha);
  if (!description) return undefined;
  return mutationStatus(description) ?? undefined;
}

async function fetchMutationStatus(sha: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${REPO}/commits/${sha}/statuses`;
  try {
    const response = await fetch(url, {
      headers: GITHUB_HEADERS,
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return parseMutationStatus(await response.json());
  } catch {
    return null;
  }
}

function parseMutationStatus(body: unknown): string | null {
  if (!Array.isArray(body)) return null;
  for (const status of body) {
    if (!isRecord(status) || status.context !== "mutation") continue;
    return typeof status.description === "string" ? status.description : null;
  }
  return null;
}

type ParsedJob = WorkflowJob & { steps: unknown[] };

async function fetchJobs(runId: number): Promise<ParsedJob[] | null> {
  const url = `https://api.github.com/repos/${REPO}/actions/runs/${runId}/jobs`;
  try {
    const response = await fetch(url, {
      headers: GITHUB_HEADERS,
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return parseJobs(await response.json());
  } catch {
    return null;
  }
}

function parseJobs(body: unknown): ParsedJob[] | null {
  if (!isRecord(body) || !Array.isArray(body.jobs)) return null;
  const jobs: ParsedJob[] = [];
  for (const job of body.jobs) {
    if (!isRecord(job)) return null;
    if (typeof job.id !== "number") return null;
    if (typeof job.name !== "string") return null;
    if (job.conclusion !== null && typeof job.conclusion !== "string") {
      return null;
    }
    jobs.push({
      id: job.id,
      name: job.name,
      conclusion: job.conclusion,
      steps: Array.isArray(job.steps) ? job.steps : [],
    });
  }
  return jobs;
}

function mutationStep(jobs: ParsedJob[]): MutationScoreStep {
  for (const job of jobs) {
    for (const step of job.steps) {
      if (!isRecord(step) || step.name !== MUTATION_JOB_NAME) continue;
      if (
        step.conclusion === "success" ||
        step.conclusion === "failure" ||
        step.conclusion === "skipped"
      ) {
        return step.conclusion;
      }
      return "absent";
    }
  }
  return "absent";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
