"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Strategy } from "@/src/contracts/strategies";
import type { MapSession } from "@/src/contracts/mapSessions";
import { formatChaos } from "@/src/ui/formatChaos";
import {
  formatChaosPerHourOrNA,
  formatDuration,
} from "@/src/ui/formatDuration";
import { deleteMapSession, fetchMapSessions } from "./api";
import { fetchStrategies } from "../strategies/api";

const buttonClass =
  "rounded border border-current/30 px-3 py-1.5 text-sm hover:bg-current/5 disabled:opacity-50";

function formatSessionDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SessionsList() {
  const [sessions, setSessions] = useState<MapSession[] | null>(null);
  const [strategyNames, setStrategyNames] = useState<Map<string, string>>(
    new Map(),
  );
  const [strategyCount, setStrategyCount] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadError(null);
      const [sessionResult, strategyResult] = await Promise.all([
        fetchMapSessions(),
        fetchStrategies(),
      ]);
      if (cancelled) {
        return;
      }
      if (!sessionResult.ok) {
        setSessions(null);
        setLoadError(sessionResult.error.message);
        return;
      }
      if (!strategyResult.ok) {
        setSessions(null);
        setLoadError(strategyResult.error.message);
        return;
      }
      setSessions(sessionResult.data);
      setStrategyCount(strategyResult.data.length);
      setStrategyNames(
        new Map(
          strategyResult.data.map((strategy: Strategy) => [
            strategy.id,
            strategy.name,
          ]),
        ),
      );
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function confirmDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);
    const result = await deleteMapSession(id);
    setDeletingId(null);
    setPendingDeleteId(null);
    if (!result.ok) {
      setDeleteError(result.error.message);
      return;
    }
    setSessions((current) =>
      current ? current.filter((session) => session.id !== id) : current,
    );
  }

  if (sessions === null && loadError === null) {
    return <p>Loading sessions…</p>;
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

  if (sessions === null || sessions.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p>
          {strategyCount === 0
            ? "Create a strategy before logging a session."
            : "No sessions yet."}
        </p>
        {strategyCount === 0 ? (
          <Link href="/strategies/new" className="underline">
            Create a strategy
          </Link>
        ) : (
          <Link href="/sessions/new" className="underline">
            Log a session
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {deleteError !== null ? <p role="alert">{deleteError}</p> : null}
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          aria-label="Map session history"
        >
          <thead>
            <tr className="border-b border-current/20 text-left">
              <th className="px-2 py-2 font-medium" scope="col">
                Date
              </th>
              <th className="px-2 py-2 font-medium" scope="col">
                Strategy
              </th>
              <th className="px-2 py-2 font-medium" scope="col">
                Waystones
              </th>
              <th className="px-2 py-2 font-medium" scope="col">
                Duration
              </th>
              <th className="px-2 py-2 font-medium" scope="col">
                Revenue
              </th>
              <th className="px-2 py-2 font-medium" scope="col">
                Investment
              </th>
              <th className="px-2 py-2 font-medium" scope="col">
                Profit
              </th>
              <th className="px-2 py-2 font-medium" scope="col">
                Profit/hr
              </th>
              <th className="px-2 py-2 font-medium" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const confirming = pendingDeleteId === session.id;
              const deleting = deletingId === session.id;
              const date = formatSessionDate(session.createdAt);
              const strategyName =
                strategyNames.get(session.strategyId) ?? "Unknown strategy";
              const sessionAction = `session for ${strategyName}, profit ${formatChaos(session.profitChaos)}`;
              return (
                <tr key={session.id} className="border-b border-current/10">
                  <td className="px-2 py-2 whitespace-nowrap">{date}</td>
                  <td className="px-2 py-2">{strategyName}</td>
                  <td className="px-2 py-2">{session.mapsCompleted}</td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {formatDuration(session.effectiveDurationMinutes)} ·{" "}
                    {session.durationMethodLabel}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {formatChaos(session.totalRevenueChaos)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {formatChaos(session.totalInvestmentChaos)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {formatChaos(session.profitChaos)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {formatChaosPerHourOrNA(session.profitPerHourChaos)}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {confirming ? (
                        <>
                          <p className="text-sm">Delete this session?</p>
                          <button
                            type="button"
                            className={buttonClass}
                            disabled={deleting}
                            onClick={() => void confirmDelete(session.id)}
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
                        <>
                          <Link
                            href={`/sessions/${session.id}`}
                            className={buttonClass}
                            aria-label={`Edit ${sessionAction}`}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className={buttonClass}
                            aria-label={`Delete ${sessionAction}`}
                            onClick={() => {
                              setDeleteError(null);
                              setPendingDeleteId(session.id);
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
