import { eq } from "drizzle-orm";
import { applicationFlows } from "@guildora/shared";
import { requireModeratorSession } from "../../../utils/auth";
import { requireRouterParam } from "../../../utils/http";
import { getDb } from "../../../utils/db";
import {
  getFlowById,
  countPendingApplicationsForFlow,
  handleFlowStatusChange
} from "../../../utils/application-flows";
import type { ApplicationFlowSettings, ApplicationFlowStatus } from "@guildora/shared";

export default defineEventHandler(async (event) => {
  await requireModeratorSession(event);
  const flowId = requireRouterParam(event, "flowId", "Missing flow ID.");
  const db = getDb();

  const flow = await getFlowById(db, flowId);
  if (!flow) {
    throw createError({ statusCode: 404, statusMessage: "Flow not found." });
  }

  const pendingCount = await countPendingApplicationsForFlow(db, flowId);
  if (pendingCount > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Cannot delete flow with ${pendingCount} pending application(s). Review them first.`
    });
  }

  // Remove embed if active
  if (flow.status === "active") {
    await handleFlowStatusChange(
      db,
      flowId,
      flow.status as ApplicationFlowStatus,
      "inactive",
      flow.settingsJson as ApplicationFlowSettings
    );
  }

  const deletedRows = await db
    .delete(applicationFlows)
    .where(eq(applicationFlows.id, flowId))
    .returning();

  if (!deletedRows[0]) {
    throw createError({ statusCode: 404, statusMessage: "Flow not found." });
  }

  return { success: true, id: flowId };
});
