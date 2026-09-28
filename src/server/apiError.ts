import { ZodError } from "zod";
import {
  ApiErrorBodySchema,
  type ApiErrorBody,
  type ApiErrorCode,
  type ApiErrorDetail,
} from "@/src/contracts/errors";
import { CALCULATED_TOTAL_OVERFLOW_MESSAGE } from "@/src/server/money";

/** Postgres foreign-key restrict / required-relation violations (Prisma). */
const RESTRICT_CODES = new Set(["P2003", "P2014"]);

/**
 * True when Postgres refused a delete because a child row still points here.
 *
 * Prisma sometimes maps that to P2003 or P2014. On this driver, ON DELETE
 * RESTRICT arrives as a connector error whose message carries SQLSTATE 23001
 * and "violates RESTRICT setting", with no Prisma code.
 */
export function isForeignKeyRestrictError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  if (
    "code" in error &&
    RESTRICT_CODES.has(String((error as { code: unknown }).code))
  ) {
    return true;
  }
  if (!(error instanceof Error)) {
    return false;
  }
  return (
    error.message.includes("violates RESTRICT setting") ||
    error.message.includes('code: "23001"')
  );
}

export function zodErrorDetails(error: ZodError): ApiErrorDetail[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

/** 400 for a calculated total that would not fit NUMERIC(20, 8). */
export function calculatedTotalOverflow(payloadMessage: string): Response {
  return jsonError(400, "VALIDATION_ERROR", payloadMessage, [
    { path: "", message: CALCULATED_TOTAL_OVERFLOW_MESSAGE },
  ]);
}

export function jsonError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details: ApiErrorDetail[] = [],
): Response {
  const body: ApiErrorBody = ApiErrorBodySchema.parse({
    error: { code, message, details },
  });
  return Response.json(body, { status });
}

export async function readJsonBody(
  request: Request,
): Promise<{ ok: true; value: unknown } | { ok: false }> {
  try {
    return { ok: true, value: await request.json() };
  } catch {
    return { ok: false };
  }
}

/** Maps unexpected failures to INTERNAL_ERROR. Does not include the cause in the body. */
export async function withApiErrors(
  action: () => Promise<Response>,
): Promise<Response> {
  try {
    return await action();
  } catch (error) {
    console.error(error);
    return jsonError(500, "INTERNAL_ERROR", "Unexpected error");
  }
}
