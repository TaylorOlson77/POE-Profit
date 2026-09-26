import { ApiErrorBodySchema, type ApiErrorBody } from "@/src/contracts/errors";
import {
  StrategyListResponseSchema,
  StrategySchema,
  type CreateStrategyBody,
  type Strategy,
} from "@/src/contracts/strategies";

export type StrategyFailure = ApiErrorBody["error"];

export type StrategyResult<T> =
  { ok: true; data: T } | { ok: false; error: StrategyFailure };

const unexpectedError: StrategyFailure = {
  code: "INTERNAL_ERROR",
  message: "Unexpected error",
  details: [],
};

async function readError(response: Response): Promise<StrategyFailure> {
  try {
    const json: unknown = await response.json();
    const parsed = ApiErrorBodySchema.safeParse(json);
    if (parsed.success) {
      return parsed.data.error;
    }
  } catch {
    return unexpectedError;
  }
  return unexpectedError;
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  return fetch(path, { ...init, cache: "no-store" });
}

export async function fetchStrategies(): Promise<StrategyResult<Strategy[]>> {
  try {
    const response = await request("/api/strategies");
    if (!response.ok) {
      return { ok: false, error: await readError(response) };
    }
    const parsed = StrategyListResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: unexpectedError };
    }
    return { ok: true, data: parsed.data.strategies };
  } catch {
    return { ok: false, error: unexpectedError };
  }
}

export async function fetchStrategy(
  id: string,
): Promise<StrategyResult<Strategy>> {
  try {
    const response = await request(`/api/strategies/${encodeURIComponent(id)}`);
    if (!response.ok) {
      return { ok: false, error: await readError(response) };
    }
    const parsed = StrategySchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: unexpectedError };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, error: unexpectedError };
  }
}

async function writeStrategy(
  path: string,
  method: "POST" | "PUT",
  body: CreateStrategyBody,
): Promise<StrategyResult<Strategy>> {
  try {
    const response = await request(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return { ok: false, error: await readError(response) };
    }
    const parsed = StrategySchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: unexpectedError };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, error: unexpectedError };
  }
}

export function createStrategy(
  body: CreateStrategyBody,
): Promise<StrategyResult<Strategy>> {
  return writeStrategy("/api/strategies", "POST", body);
}

export function updateStrategy(
  id: string,
  body: CreateStrategyBody,
): Promise<StrategyResult<Strategy>> {
  return writeStrategy(
    `/api/strategies/${encodeURIComponent(id)}`,
    "PUT",
    body,
  );
}

export async function deleteStrategy(
  id: string,
): Promise<StrategyResult<null>> {
  try {
    const response = await request(
      `/api/strategies/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    if (response.status === 204) {
      return { ok: true, data: null };
    }
    return { ok: false, error: await readError(response) };
  } catch {
    return { ok: false, error: unexpectedError };
  }
}
