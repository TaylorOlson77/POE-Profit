import { roundForDisplay } from "@/src/domain/calc";
import { formatChaos } from "./formatChaos";

/**
 * Human-readable effective duration. Presentation only: rounds with
 * `roundForDisplay`, then splits hours and minutes with Decimal.
 * `80` → `1h 20m`. `0` → `0m`.
 */
export function formatDuration(minutesValue: string): string {
  const total = roundForDisplay(minutesValue);
  const hours = total.divToInt(60);
  const remainder = total.minus(hours.times(60));
  if (hours.isZero()) {
    return `${remainder.toString()}m`;
  }
  return `${hours.toString()}h ${remainder.toString()}m`;
}

/** Minutes beside the human-readable duration, same display rounding. */
export function formatDurationMinutes(minutesValue: string): string {
  return `${roundForDisplay(minutesValue).toString()} min`;
}

export function formatPlainOrNA(value: string | null): string {
  return value === null ? "N/A" : roundForDisplay(value).toString();
}

export function formatPercentOrNA(value: string | null): string {
  return value === null ? "N/A" : `${roundForDisplay(value).toString()}%`;
}

export function formatChaosPerHourOrNA(value: string | null): string {
  return value === null ? "N/A" : `${formatChaos(value)}/h`;
}
