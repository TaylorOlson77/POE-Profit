import Link from "next/link";
import { StrategiesList } from "./strategies/strategies-list";

const buttonClass =
  "rounded border border-current/30 px-3 py-1.5 text-sm hover:bg-current/5";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">POE Profit</h1>
          <p className="text-sm opacity-80">
            Farming strategies and the cost to run one waystone.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/sessions" className={buttonClass}>
            Sessions
          </Link>
          <Link href="/strategies/new" className={buttonClass}>
            New strategy
          </Link>
        </div>
      </header>
      <StrategiesList />
    </main>
  );
}
