import type { Metadata } from "next";
import Link from "next/link";
import { SessionForm } from "../session-form";

export const metadata: Metadata = {
  title: "Edit session · POE Profit",
};

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <Link href="/sessions" className="text-sm underline">
        Sessions
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Edit session</h1>
      <SessionForm mode="edit" sessionId={id} />
    </main>
  );
}
