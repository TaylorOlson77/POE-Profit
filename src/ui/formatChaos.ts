import { roundForDisplay } from "@/src/domain/calc";

/** Presentation only. Wire strings stay decimal strings; this does not parse with Number(). */
export function formatChaos(value: string): string {
  return `${roundForDisplay(value).toString()}c`;
}
