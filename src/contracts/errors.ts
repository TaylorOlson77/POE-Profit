import { z } from "zod";

/**
 * Shared API error body (ARCHITECTURE §5.2 — finalized in B1).
 *
 * Example:
 * {
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Invalid strategy payload",
 *     "details": [{ "path": "name", "message": "Required" }]
 *   }
 * }
 */
export const ApiErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_ERROR",
]);

export const ApiErrorDetailSchema = z.object({
  path: z.string(),
  message: z.string(),
});

export const ApiErrorBodySchema = z.object({
  error: z.object({
    code: ApiErrorCodeSchema,
    message: z.string(),
    details: z.array(ApiErrorDetailSchema).default([]),
  }),
});

export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;
export type ApiErrorDetail = z.infer<typeof ApiErrorDetailSchema>;
export type ApiErrorBody = z.infer<typeof ApiErrorBodySchema>;
