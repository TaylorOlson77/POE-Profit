import type { Metadata } from "next";
import Link from "next/link";
import { loadLatestResults } from "../../src/quality/loadLatestResults";
import {
  formatResultDate,
  type CheckResult,
  type MutationResult,
} from "../../src/quality/latestResults";

export const metadata: Metadata = {
  title: "Quality · POE Profit",
};

const LINES = [
  {
    name: "CI",
    key: "ci",
    covers:
      "Lint, typecheck, unit tests, API tests, and the production build.",
  },
  {
    name: "Playwright",
    key: "playwright",
    covers: "Browser journeys through strategies and sessions.",
  },
  {
    name: "Visual",
    key: "visual",
    covers:
      "Screenshots of the six settled pages on a desktop and two phones.",
  },
  {
    name: "Mutation",
    key: "mutation",
    covers: "Changes to the profit calc that the unit tests still catch.",
  },
] as const;

export default async function QualityPage() {
  const results = await loadLatestResults();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <Link href="/" className="text-sm underline">
        Strategies
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Quality</h1>
      </header>
      <ul>
        {LINES.map((item) => (
          <ResultRow
            key={item.key}
            name={item.name}
            covers={item.covers}
            line={results[item.key]}
          />
        ))}
      </ul>
    </main>
  );
}

function ResultRow({
  name,
  covers,
  line,
}: {
  name: string;
  covers: string;
  line: CheckResult | MutationResult;
}) {
  const result = "score" in line ? line.score : line.text;
  const meta =
    "score" in line
      ? `${formatResultDate(line.at)}. ${line.detail}`
      : "at" in line
        ? formatResultDate(line.at)
        : null;

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-t border-current/15 py-3.5 text-sm last:border-b">
      <div className="flex flex-col gap-1">
        <span>{name}</span>
        <span className="text-xs opacity-80">{covers}</span>
        {meta ? <span className="text-xs opacity-80">{meta}</span> : null}
      </div>
      <span className="font-medium tabular-nums">{result}</span>
    </li>
  );
}
