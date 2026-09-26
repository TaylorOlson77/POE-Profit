"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Strategy } from "@/src/contracts/strategies";
import { formatChaos } from "@/src/ui/formatChaos";
import { strategyLabels } from "@/src/ui/strategyLabels";
import { deleteStrategy, fetchStrategies } from "./api";

const buttonClass =
  "rounded border border-current/30 px-3 py-1.5 text-sm hover:bg-current/5";

export function StrategiesList() {
  const [strategies, setStrategies] = useState<Strategy[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadError(null);
      const result = await fetchStrategies();
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setStrategies(null);
        setLoadError(result.error.message);
        return;
      }
      setStrategies(result.data);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function confirmDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);
    const result = await deleteStrategy(id);
    setDeletingId(null);
    setPendingDeleteId(null);
    if (!result.ok) {
      setDeleteError(result.error.message);
      return;
    }
    setStrategies((current) =>
      current ? current.filter((strategy) => strategy.id !== id) : current,
    );
  }

  if (strategies === null && loadError === null) {
    return <p>Loading strategies…</p>;
  }

  if (loadError !== null) {
    return (
      <div className="flex flex-col items-start gap-3" role="alert">
        <p>{loadError}</p>
        <button
          type="button"
          className={buttonClass}
          onClick={() => setReloadKey((key) => key + 1)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (strategies === null || strategies.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p>No strategies yet.</p>
        <Link href="/strategies/new" className="underline">
          Create a strategy
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {deleteError !== null ? <p role="alert">{deleteError}</p> : null}
      <ul className="flex flex-col gap-4">
        {strategies.map((strategy) => {
          const labels = strategyLabels(strategy.game);
          const confirming = pendingDeleteId === strategy.id;
          const deleting = deletingId === strategy.id;
          return (
            <li
              key={strategy.id}
              className="flex flex-col gap-3 rounded border border-current/15 p-4"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">{strategy.name}</h2>
                <p className="text-sm opacity-70">{labels.gameName}</p>
                <p className="line-clamp-3 text-sm">{strategy.description}</p>
                <p>
                  {labels.costPer}:{" "}
                  {formatChaos(strategy.estimatedCostPerMapChaos)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/strategies/${strategy.id}`}
                  className={buttonClass}
                  aria-label={`Edit ${strategy.name}`}
                >
                  Edit
                </Link>
                {confirming ? (
                  <>
                    <p className="text-sm">Delete {strategy.name}?</p>
                    <button
                      type="button"
                      className={buttonClass}
                      disabled={deleting}
                      onClick={() => void confirmDelete(strategy.id)}
                    >
                      Confirm delete
                    </button>
                    <button
                      type="button"
                      className={buttonClass}
                      disabled={deleting}
                      onClick={() => setPendingDeleteId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={buttonClass}
                    aria-label={`Delete ${strategy.name}`}
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDeleteId(strategy.id);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
