import { applicationFlows } from "@guildora/shared";
import type { ApplicationFlowGraph, ApplicationFlowSettings } from "@guildora/shared";
import { requireModeratorSession } from "../../../../utils/auth";
import { requireRouterParam } from "../../../../utils/http";
import { getDb } from "../../../../utils/db";
import { getFlowById } from "../../../../utils/application-flows";

export default defineEventHandler(async (event) => {
  const session = await requireModeratorSession(event);
  const flowId = requireRouterParam(event, "flowId", "Missing flow ID.");
  const db = getDb();

  const flow = await getFlowById(db, flowId);
  if (!flow) {
    throw createError({ statusCode: 404, statusMessage: "Flow not found." });
  }

  const [duplicate] = await db
    .insert(applicationFlows)
    .values({
      name: `${flow.name} (Copy)`,
      status: "draft",
      flowJson: flow.flowJson as ApplicationFlowGraph,
      settingsJson: flow.settingsJson as ApplicationFlowSettings,
      createdBy: session.user.id
    })
    .returning();

  return { flow: duplicate };
});
