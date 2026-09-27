import type { Metadata } from "next";
import Link from "next/link";
import { SessionsList } from "./sessions-list";

const buttonClass =
  "rounded border border-current/30 px-3 py-1.5 text-sm hover:bg-current/5";

export const metadata: Metadata = {
  title: "Sessions · POE Profit",
};

export default function SessionsPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <Link href="/" className="text-sm underline">
        Strategies
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Sessions</h1>
        <Link href="/sessions/new" className={buttonClass}>
          New session
        </Link>
      </header>
      <SessionsList />
    </main>
  );
}
