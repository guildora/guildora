import { requireModeratorSession } from "../../../utils/auth";
import { requireRouterParam } from "../../../utils/http";
import { getDb } from "../../../utils/db";
import { getFlowById } from "../../../utils/application-flows";

export default defineEventHandler(async (event) => {
  await requireModeratorSession(event);
  const flowId = requireRouterParam(event, "flowId", "Missing flow ID.");
  const db = getDb();

  const flow = await getFlowById(db, flowId);
  if (!flow) {
    throw createError({ statusCode: 404, statusMessage: "Flow not found." });
  }

  return { flow };
});
