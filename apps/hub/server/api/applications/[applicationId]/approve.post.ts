import { eq } from "drizzle-orm";
import { applications, applicationFlows } from "@guildora/shared";
import type { ApplicationFlowSettings } from "@guildora/shared";
import { requireModeratorSession } from "../../../utils/auth";
import { requireRouterParam } from "../../../utils/http";
import { getDb } from "../../../utils/db";
import {
  addDiscordRolesToMember,
  removeDiscordRolesFromBot,
  setDiscordNickname,
  sendDiscordDm,
  sendChannelMessage
} from "../../../utils/botSync";

export default defineEventHandler(async (event) => {
  const session = await requireModeratorSession(event);
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

  if (app.status !== "pending") {
    throw createError({ statusCode: 400, statusMessage: "Application is not pending." });
  }

  // Load flow settings
  const [flow] = await db
    .select()
    .from(applicationFlows)
    .where(eq(applicationFlows.id, app.flowId))
    .limit(1);

  const settings = flow?.settingsJson as ApplicationFlowSettings | undefined;
  const warnings: string[] = [];

  // Assign "on approval" roles
  if (settings?.roles.onApproval?.length) {
    try {
      await addDiscordRolesToMember(app.discordId, settings.roles.onApproval);
    } catch {
      warnings.push("Failed to assign approval roles.");
    }
  }

  // Remove "on approval" roles
  const removeOnApproval = settings?.roles.removeOnApproval || [];
  if (removeOnApproval.length > 0) {
    try {
      await removeDiscordRolesFromBot(app.discordId, { roleIds: removeOnApproval });
    } catch {
      warnings.push("Failed to remove approval roles.");
    }
  }

  // Set nickname
  if (app.displayNameComposed) {
    try {
      await setDiscordNickname(app.discordId, app.displayNameComposed);
    } catch {
      // Non-blocking
    }
  }

  // Send approval DM
  if (settings?.messages.dmOnApproval) {
    sendDiscordDm(app.discordId, settings.messages.dmOnApproval).catch(() => {});
  }

  // Send welcome message
  if (settings?.welcome.channelId && settings?.welcome.messageTemplate) {
    const welcomeMsg = settings.welcome.messageTemplate.replace(
      /\{discordId\}/g,
      `<@${app.discordId}>`
    );
    try {
      await sendChannelMessage(settings.welcome.channelId, welcomeMsg);
    } catch {
      warnings.push("Welcome message could not be sent.");
    }
  }

  // Update application status
  await db
    .update(applications)
    .set({
      status: "approved",
      reviewedBy: session.user.id,
      reviewedAt: new Date()
    })
    .where(eq(applications.id, applicationId));

  return { success: true, warnings };
});
