export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        POE Profit
      </h1>
      <p className="text-lg text-zinc-600">
        Path of Exile farming strategy profitability tracker. MVP scaffold is in
        place — strategies, runs, and calculations come next.
      </p>
      <p className="text-sm text-zinc-500">
        See <code className="font-mono">docs/AGENTS.md</code> and{" "}
        <code className="font-mono">docs/BACKLOG.md</code> for build order.
      </p>
    </main>
  );
}
