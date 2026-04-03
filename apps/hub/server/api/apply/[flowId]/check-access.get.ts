import { eq, and } from "drizzle-orm";
import { applicationFlows, applications, communitySettings } from "@guildora/shared";
import type { ApplicationFlowGraph, ApplicationFlowSettings } from "@guildora/shared";
import { requireSession } from "../../../utils/auth";
import { getDb } from "../../../utils/db";
import { fetchDiscordGuildMemberFromBot } from "../../../utils/botSync";

export default defineEventHandler(async (event) => {
  const session = await requireSession(event);
  const flowId = getRouterParam(event, "flowId");
  if (!flowId) throw createError({ statusCode: 400, statusMessage: "Missing flow ID." });

  const discordId = session.user.discordId;
  if (!discordId) throw createError({ statusCode: 400, statusMessage: "No Discord ID in session." });

  const db = getDb();

  // Load the flow
  const [flow] = await db
    .select()
    .from(applicationFlows)
    .where(eq(applicationFlows.id, flowId))
    .limit(1);

  if (!flow || flow.status !== "active") {
    throw createError({ statusCode: 404, statusMessage: "Flow not found or inactive." });
  }

  const settings = flow.settingsJson as ApplicationFlowSettings;

  // Check guild membership
  let isMember = false;
  try {
    const result = await fetchDiscordGuildMemberFromBot(discordId);
    isMember = !!result?.member;
  } catch {
    isMember = false;
  }

  if (!isMember) {
    // Get invite code for "join Discord" message
    const [community] = await db.select().from(communitySettings).limit(1);
    return {
      access: "not_member" as const,
      discordInviteCode: community?.discordInviteCode || null
    };
  }

  // Check concurrency - already applied?
  if (!settings.concurrency.allowReapplyToSameFlow) {
    const [existing] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(and(
        eq(applications.flowId, flowId),
        eq(applications.discordId, discordId),
        eq(applications.status, "pending")
      ))
      .limit(1);

    if (existing) {
      return { access: "already_applied" as const };
    }
  }

  return {
    access: "granted" as const,
    flow: {
      id: flow.id,
      name: flow.name,
      flowJson: flow.flowJson as ApplicationFlowGraph,
      settings: {
        messages: {
          tokenExpired: settings.messages.tokenExpired,
          submissionConfirmation: settings.messages.submissionConfirmation
        }
      }
    },
    user: {
      discordId: session.user.discordId,
      discordUsername: session.user.profileName || "User",
      discordAvatarUrl: session.user.avatarUrl || null
    }
  };
});
