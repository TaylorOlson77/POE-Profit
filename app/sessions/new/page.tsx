import type { Metadata } from "next";
import Link from "next/link";
import { SessionForm } from "../session-form";

export const metadata: Metadata = {
  title: "New session · POE Profit",
};

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ strategyId?: string | string[] }>;
}) {
  const { strategyId } = await searchParams;
  const initialStrategyId = Array.isArray(strategyId)
    ? strategyId[0]
    : strategyId;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <Link href="/sessions" className="text-sm underline">
        Sessions
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">New session</h1>
      <SessionForm mode="create" initialStrategyId={initialStrategyId} />
    </main>
  );
}
