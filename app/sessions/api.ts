import { ApiErrorBodySchema, type ApiErrorBody } from "@/src/contracts/errors";
import {
  MapSessionListResponseSchema,
  MapSessionSchema,
  type CreateMapSessionBody,
  type MapSession,
} from "@/src/contracts/mapSessions";

export type MapSessionFailure = ApiErrorBody["error"];

export type MapSessionResult<T> =
  { ok: true; data: T } | { ok: false; error: MapSessionFailure };

const unexpectedError: MapSessionFailure = {
  code: "INTERNAL_ERROR",
  message: "Unexpected error",
  details: [],
};

async function readError(response: Response): Promise<MapSessionFailure> {
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

export async function fetchMapSessions(): Promise<MapSessionResult<MapSession[]>> {
  try {
    const response = await request("/api/map-sessions");
    if (!response.ok) {
      return { ok: false, error: await readError(response) };
    }
    const parsed = MapSessionListResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: unexpectedError };
    }
    return { ok: true, data: parsed.data.mapSessions };
  } catch {
    return { ok: false, error: unexpectedError };
  }
}

export async function fetchMapSession(
  id: string,
): Promise<MapSessionResult<MapSession>> {
  try {
    const response = await request(
      `/api/map-sessions/${encodeURIComponent(id)}`,
    );
    if (!response.ok) {
      return { ok: false, error: await readError(response) };
    }
    const parsed = MapSessionSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: unexpectedError };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, error: unexpectedError };
  }
}

async function writeMapSession(
  path: string,
  method: "POST" | "PUT",
  body: CreateMapSessionBody,
): Promise<MapSessionResult<MapSession>> {
  try {
    const response = await request(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return { ok: false, error: await readError(response) };
    }
    const parsed = MapSessionSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: unexpectedError };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, error: unexpectedError };
  }
}

export function createMapSession(
  body: CreateMapSessionBody,
): Promise<MapSessionResult<MapSession>> {
  return writeMapSession("/api/map-sessions", "POST", body);
}

export function updateMapSession(
  id: string,
  body: CreateMapSessionBody,
): Promise<MapSessionResult<MapSession>> {
  return writeMapSession(
    `/api/map-sessions/${encodeURIComponent(id)}`,
    "PUT",
    body,
  );
}

export async function deleteMapSession(
  id: string,
): Promise<MapSessionResult<null>> {
  try {
    const response = await request(
      `/api/map-sessions/${encodeURIComponent(id)}`,
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
