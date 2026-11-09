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
    areas: [
      "strategy API",
      "session API",
      "profit calc",
      "the strategy and session forms",
      "lint, typecheck, and the production build",
    ],
  },
  {
    name: "Playwright",
    key: "playwright",
    covers: "Browser journeys through strategies and sessions.",
    areas: [
      "create, update, and delete a strategy",
      "create, update, and delete a session",
      "the six settled pages",
    ],
  },
  {
    name: "Visual",
    key: "visual",
    covers:
      "Screenshots of the six settled pages on a desktop and two phones.",
    areas: [
      "home, new strategy, strategy, sessions, new session, and session",
      "desktop, iPhone 13, and Pixel 7",
    ],
  },
  {
    name: "Mutation",
    key: "mutation",
    covers: "Changes to the profit calc that the unit tests still catch.",
    areas: ["line totals", "profit", "session money", "rates"],
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
            areas={item.areas}
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
  areas,
  line,
}: {
  name: string;
  covers: string;
  areas: readonly string[];
  line: CheckResult | MutationResult;
}) {
  const result = "score" in line ? line.score : line.text;
  const meta = "at" in line ? <ResultDate line={line} /> : null;

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-t border-current/15 py-3.5 text-sm last:border-b">
      <div className="flex flex-col gap-1">
        <span>{name}</span>
        <span className="text-xs opacity-80">{covers}</span>
        <details className="text-xs opacity-80">
          <summary className="cursor-pointer">Areas</summary>
          <ul className="list-disc pl-4">
            {areas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </details>
        {meta}
      </div>
      <span className="font-medium tabular-nums">{result}</span>
    </li>
  );
}

function ResultDate({
  line,
}: {
  line: (CheckResult | MutationResult) & { at: string; href: string };
}) {
  const date = (
    <a href={line.href} className="underline">
      {formatResultDate(line.at)}
    </a>
  );
  if (!("score" in line)) {
    return <span className="text-xs opacity-80">{date}</span>;
  }
  return (
    <span className="text-xs opacity-80">
      {date}. {line.detail}
    </span>
  );
}
