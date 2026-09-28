import { prisma } from "@/src/server/db/prisma";
import {
  calculatedTotalOverflow,
  jsonError,
  readJsonBody,
  withApiErrors,
  zodErrorDetails,
} from "@/src/server/apiError";
import {
  StrategyIdParamSchema,
  UpdateStrategyBodySchema,
} from "@/src/contracts/strategies";
import {
  deleteStrategy,
  getStrategy,
  updateStrategy,
} from "@/src/server/services/strategies";

type IdContext = { params: Promise<{ id: string }> };

const CONFLICT_MESSAGE =
  "Cannot delete a strategy that still has map sessions";

async function readId(
  context: IdContext,
): Promise<{ ok: true; id: string } | { ok: false; response: Response }> {
  const { id } = await context.params;
  const parsed = StrategyIdParamSchema.safeParse({ id });
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError(404, "NOT_FOUND", "Strategy not found"),
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
    const strategy = await getStrategy(prisma, id.id);
    if (!strategy) {
      return jsonError(404, "NOT_FOUND", "Strategy not found");
    }
    return Response.json(strategy);
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
      return jsonError(400, "VALIDATION_ERROR", "Invalid strategy payload", [
        { path: "", message: "Invalid JSON" },
      ]);
    }

    const parsed = UpdateStrategyBodySchema.safeParse(json.value);
    if (!parsed.success) {
      return jsonError(
        400,
        "VALIDATION_ERROR",
        "Invalid strategy payload",
        zodErrorDetails(parsed.error),
      );
    }

    const result = await updateStrategy(prisma, id.id, parsed.data);
    if (result.status === "total_overflow") {
      return calculatedTotalOverflow("Invalid strategy payload");
    }
    if (result.status === "not_found") {
      return jsonError(404, "NOT_FOUND", "Strategy not found");
    }
    return Response.json(result.strategy);
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

    const result = await deleteStrategy(prisma, id.id);
    if (result.status === "not_found") {
      return jsonError(404, "NOT_FOUND", "Strategy not found");
    }
    if (result.status === "conflict") {
      return jsonError(409, "CONFLICT", CONFLICT_MESSAGE);
    }
    return new Response(null, { status: 204 });
  });
}
