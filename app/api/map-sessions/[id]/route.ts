import { prisma } from "@/src/server/db/prisma";
import {
  calculatedTotalOverflow,
  jsonError,
  readJsonBody,
  withApiErrors,
  zodErrorDetails,
} from "@/src/server/apiError";
import {
  MapSessionIdParamSchema,
  UpdateMapSessionBodySchema,
} from "@/src/contracts/mapSessions";
import {
  deleteMapSession,
  getMapSession,
  updateMapSession,
} from "@/src/server/services/mapSessions";

type IdContext = { params: Promise<{ id: string }> };

async function readId(
  context: IdContext,
): Promise<{ ok: true; id: string } | { ok: false; response: Response }> {
  const { id } = await context.params;
  const parsed = MapSessionIdParamSchema.safeParse({ id });
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError(404, "NOT_FOUND", "Map session not found"),
    };
  }
  return { ok: true, id: parsed.data.id };
}

export async function GET(
  _request: Request,
  context: IdContext,
): Promise<Response> {
  return withApiErrors(async () => {
    const id = await readId(context);
    if (!id.ok) {
      return id.response;
    }
    const session = await getMapSession(prisma, id.id);
    if (!session) {
      return jsonError(404, "NOT_FOUND", "Map session not found");
    }
    return Response.json(session);
  });
}

export async function PUT(
  request: Request,
  context: IdContext,
): Promise<Response> {
  return withApiErrors(async () => {
    const id = await readId(context);
    if (!id.ok) {
      return id.response;
    }

    const json = await readJsonBody(request);
    if (!json.ok) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid map session payload", [
        { path: "", message: "Invalid JSON" },
      ]);
    }

    const parsed = UpdateMapSessionBodySchema.safeParse(json.value);
    if (!parsed.success) {
      return jsonError(
        400,
        "VALIDATION_ERROR",
        "Invalid map session payload",
        zodErrorDetails(parsed.error),
      );
    }

    const result = await updateMapSession(prisma, id.id, parsed.data);
    if (result.status === "not_found") {
      return jsonError(404, "NOT_FOUND", "Map session not found");
    }
    if (result.status === "strategy_not_found") {
      return jsonError(404, "NOT_FOUND", "Strategy not found");
    }
    if (result.status === "total_overflow") {
      return calculatedTotalOverflow("Invalid map session payload");
    }
    return Response.json(result.session);
  });
}

export async function DELETE(
  _request: Request,
  context: IdContext,
): Promise<Response> {
  return withApiErrors(async () => {
    const id = await readId(context);
    if (!id.ok) {
      return id.response;
    }

    const result = await deleteMapSession(prisma, id.id);
    if (result.status === "not_found") {
      return jsonError(404, "NOT_FOUND", "Map session not found");
    }
    return new Response(null, { status: 204 });
  });
}
