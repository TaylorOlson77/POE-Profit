import { prisma } from "@/src/server/db/prisma";
import {
  calculatedTotalOverflow,
  jsonError,
  readJsonBody,
  withApiErrors,
  zodErrorDetails,
} from "@/src/server/apiError";
import {
  CreateMapSessionBodySchema,
  MapSessionListResponseSchema,
} from "@/src/contracts/mapSessions";
import {
  createMapSession,
  listMapSessions,
} from "@/src/server/services/mapSessions";

export async function GET(): Promise<Response> {
  return withApiErrors(async () => {
    const body = MapSessionListResponseSchema.parse({
      mapSessions: await listMapSessions(prisma),
    });
    return Response.json(body);
  });
}

export async function POST(request: Request): Promise<Response> {
  return withApiErrors(async () => {
    const json = await readJsonBody(request);
    if (!json.ok) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid map session payload", [
        { path: "", message: "Invalid JSON" },
      ]);
    }

    const parsed = CreateMapSessionBodySchema.safeParse(json.value);
    if (!parsed.success) {
      return jsonError(
        400,
        "VALIDATION_ERROR",
        "Invalid map session payload",
        zodErrorDetails(parsed.error),
      );
    }

    const result = await createMapSession(prisma, parsed.data);
    if (result.status === "strategy_not_found") {
      return jsonError(404, "NOT_FOUND", "Strategy not found");
    }
    if (result.status === "total_overflow") {
      return calculatedTotalOverflow("Invalid map session payload");
    }
    return Response.json(result.session, { status: 201 });
  });
}
