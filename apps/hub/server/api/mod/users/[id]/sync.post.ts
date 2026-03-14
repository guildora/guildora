import { requireModeratorSession } from "../../../../utils/auth";
import { getUserById, getUserRoles } from "../../../../utils/community";
import { syncDiscordUserFromWebsite } from "../../../../utils/botSync";
import { requireRouterParam } from "../../../../utils/http";

export default defineEventHandler(async (event) => {
  await requireModeratorSession(event);
  const userId = requireRouterParam(event, "id", "Missing user id.");

  const [user, permissionRoles] = await Promise.all([getUserById(userId), getUserRoles(userId)]);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found." });
  }

  await syncDiscordUserFromWebsite({
    discordId: user.discordId,
    profileName: user.displayName,
    permissionRoles
  });

  return { ok: true };
});
