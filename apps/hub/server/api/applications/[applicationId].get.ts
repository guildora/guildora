import { eq, and, ne } from "drizzle-orm";
import { applications, applicationFlows } from "@guildora/shared";
import type { ApplicationFlowGraph, ApplicationFlowSettings } from "@guildora/shared";
import { requireModeratorSession } from "../../utils/auth";
import { requireRouterParam } from "../../utils/http";
import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  await requireModeratorSession(event);
  const applicationId = requireRouterParam(event, "applicationId", "Missing application ID.");
  const db = getDb();

  const [app] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (!app) {
    throw createError({ statusCode: 404, statusMessage: "Application not found." });
  }

  // Load flow
  const [flow] = await db
    .select()
    .from(applicationFlows)
    .where(eq(applicationFlows.id, app.flowId))
    .limit(1);

  // Check for previous applications by same user
  const previousApps = await db
    .select({
      id: applications.id,
      flowId: applications.flowId,
      status: applications.status,
      createdAt: applications.createdAt
    })
    .from(applications)
    .where(
      and(
        eq(applications.discordId, app.discordId),
        ne(applications.id, app.id)
      )
    );

  return {
    application: {
      id: app.id,
      flowId: app.flowId,
      discordId: app.discordId,
      discordUsername: app.discordUsername,
      discordAvatarUrl: app.discordAvatarUrl,
      answersJson: app.answersJson,
      status: app.status,
      rolesAssigned: app.rolesAssigned,
      pendingRoleAssignments: app.pendingRoleAssignments,
      displayNameComposed: app.displayNameComposed,
      reviewedBy: app.reviewedBy,
      reviewedAt: app.reviewedAt,
      createdAt: app.createdAt
    },
    flow: flow ? {
      id: flow.id,
      name: flow.name,
      flowJson: flow.flowJson as ApplicationFlowGraph,
      settingsJson: flow.settingsJson as ApplicationFlowSettings
    } : null,
    previousApplications: previousApps.map((pa) => ({
      id: pa.id,
      flowId: pa.flowId,
      status: pa.status,
      createdAt: pa.createdAt
    }))
  };
});
