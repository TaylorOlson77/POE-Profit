import { roundForDisplay } from "@/src/domain/calc";

/** Presentation only. Wire strings stay decimal strings; this does not parse with Number(). */
export function formatChaos(value: string): string {
  return `${roundForDisplay(value).toString()}c`;
}

/** Null calculated money is N/A (zero duration, zero maps, and similar). */
export function formatChaosOrNA(value: string | null): string {
  return value === null ? "N/A" : formatChaos(value);
}
