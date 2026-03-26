import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { applicationFlows, applications } from "@guildora/shared";
import type { ApplicationFlowSettings, ApplicationFlowGraph } from "@guildora/shared";
import { verifyAndLoadToken } from "../../../utils/application-tokens";
import { requireRouterParam, readBodyWithSchema } from "../../../utils/http";
import { getDb } from "../../../utils/db";

const bodySchema = z.object({
  token: z.string().min(1)
});

export default defineEventHandler(async (event) => {
  const flowId = requireRouterParam(event, "flowId", "Missing flow ID.");
  const { token } = await readBodyWithSchema(event, bodySchema, "Missing or invalid token.");

  const verified = await verifyAndLoadToken(token);
  if (!verified) {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired token." });
  }

  if (verified.flowId !== flowId) {
    throw createError({ statusCode: 400, statusMessage: "Token does not match this flow." });
  }

  const db = getDb();

  const [flow] = await db
    .select()
    .from(applicationFlows)
    .where(eq(applicationFlows.id, flowId))
    .limit(1);

  if (!flow || flow.status !== "active") {
    throw createError({ statusCode: 404, statusMessage: "Flow not found or inactive." });
  }

  const settings = flow.settingsJson as ApplicationFlowSettings;

  if (!settings.concurrency.allowReapplyToSameFlow) {
    const [existing] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(and(
        eq(applications.flowId, flowId),
        eq(applications.discordId, verified.discordId),
        eq(applications.status, "pending")
      ))
      .limit(1);

    if (existing) {
      throw createError({ statusCode: 409, statusMessage: "You already have an open application for this flow." });
    }
  }

  if (!settings.concurrency.allowCrossFlowApplications) {
    const [existing] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(and(
        eq(applications.discordId, verified.discordId),
        eq(applications.status, "pending")
      ))
      .limit(1);

    if (existing) {
      throw createError({ statusCode: 409, statusMessage: "You already have an open application." });
    }
  }

  return {
    valid: true,
    user: {
      discordId: verified.discordId,
      discordUsername: verified.discordUsername,
      discordAvatarUrl: verified.discordAvatarUrl
    },
    flow: {
      id: flow.id,
      name: flow.name,
      flowJson: flow.flowJson as ApplicationFlowGraph,
      settings: {
        messages: settings.messages
      }
    }
  };
});
