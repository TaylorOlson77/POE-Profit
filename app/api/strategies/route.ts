import { prisma } from "@/src/server/db/prisma";
import {
  jsonError,
  readJsonBody,
  withApiErrors,
  zodErrorDetails,
} from "@/src/server/apiError";
import {
  CreateStrategyBodySchema,
  StrategyListResponseSchema,
} from "@/src/contracts/strategies";
import { createStrategy, listStrategies } from "@/src/server/services/strategies";

export async function GET(): Promise<Response> {
  return withApiErrors(async () => {
    const body = StrategyListResponseSchema.parse({
      strategies: await listStrategies(prisma),
    });
    return Response.json(body);
  });
}

export async function POST(request: Request): Promise<Response> {
  return withApiErrors(async () => {
    const json = await readJsonBody(request);
    if (!json.ok) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid strategy payload", [
        { path: "", message: "Invalid JSON" },
      ]);
    }

    const parsed = CreateStrategyBodySchema.safeParse(json.value);
    if (!parsed.success) {
      return jsonError(
        400,
        "VALIDATION_ERROR",
        "Invalid strategy payload",
        zodErrorDetails(parsed.error),
      );
    }

    const strategy = await createStrategy(prisma, parsed.data);
    return Response.json(strategy, { status: 201 });
  });
}
