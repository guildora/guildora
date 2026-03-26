import { eq } from "drizzle-orm";
import { applications } from "@guildora/shared";
import { requireModeratorSession } from "../../../utils/auth";
import { requireRouterParam } from "../../../utils/http";
import { getDb } from "../../../utils/db";
import { addDiscordRolesToMember } from "../../../utils/botSync";

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

  const pendingRoles = app.pendingRoleAssignments as string[] | null;
  if (!pendingRoles?.length) {
    return { success: true, message: "No pending role assignments." };
  }

  try {
    const result = await addDiscordRolesToMember(app.discordId, pendingRoles);
    const addedRoleIds = result?.addedRoleIds || [];
    const currentAssigned = (app.rolesAssigned as string[] | null) || [];

    await db
      .update(applications)
      .set({
        rolesAssigned: [...new Set([...currentAssigned, ...addedRoleIds])],
        pendingRoleAssignments: []
      })
      .where(eq(applications.id, applicationId));

    return { success: true, addedRoleIds };
  } catch {
    throw createError({ statusCode: 500, statusMessage: "Failed to assign roles." });
  }
});
