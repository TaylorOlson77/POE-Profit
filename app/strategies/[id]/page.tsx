import type { Metadata } from "next";
import Link from "next/link";
import { StrategyForm } from "../strategy-form";

export const metadata: Metadata = {
  title: "Edit strategy · POE Profit",
};

export default async function EditStrategyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <Link href="/" className="text-sm underline">
        Strategies
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Edit strategy</h1>
      <StrategyForm mode="edit" strategyId={id} />
    </main>
  );
}
