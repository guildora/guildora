import { eq } from "drizzle-orm";
import { coerceProfileNameFromRaw, users } from "@guildora/shared";
import { replaceAuthSessionForUserId } from "../../../utils/auth-session";
import { fetchDiscordGuildMemberFromBot, fetchDiscordGuildRolesFromBot } from "../../../utils/botSync";
import { requireAdminSession, requireRole } from "../../../utils/auth";
import { collectMappedRolesForMember } from "../../../utils/admin-mirror";
import { ensureCommunityUser, ensureUserProfile, listActiveCommunityRoleMappings, upsertCommunityRoleAssignment } from "../../../utils/community";
import { getDb } from "../../../utils/db";
import { replaceUserDiscordRolesSnapshotFromMember } from "../../../utils/discord-roles";

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);
  requireRole(session.user, ["superadmin"]);

  const db = getDb();
  const userRows = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  const userRow = userRows[0];
  if (!userRow) {
    throw createError({ statusCode: 404, statusMessage: "User not found." });
  }

  const [memberResponse, guildRolesResponse, mappings] = await Promise.all([
    fetchDiscordGuildMemberFromBot(userRow.discordId),
    fetchDiscordGuildRolesFromBot(),
    listActiveCommunityRoleMappings()
  ]);
  const member = memberResponse.member;
  if (!member) {
    throw createError({ statusCode: 404, statusMessage: "Discord member not found in guild." });
  }

  const runtime = useRuntimeConfig(event);
  const superadminDiscordId = typeof runtime.superadminDiscordId === "string" ? runtime.superadminDiscordId : null;
  const sourceProfileName = member.nickname || member.displayName;
  const profileName = coerceProfileNameFromRaw(sourceProfileName, `discord-${member.discordId}`);

  const dbUser = await ensureCommunityUser({
    discordId: member.discordId,
    profileName,
    avatarUrl: member.avatarUrl,
    email: userRow.email,
    superadminDiscordId
  });
  await ensureUserProfile(dbUser.id);

  const matchedMappings = collectMappedRolesForMember(member.roleIds, mappings);
  if (matchedMappings.length === 1) {
    await upsertCommunityRoleAssignment(dbUser.id, matchedMappings[0]!.id);
  }

  await replaceUserDiscordRolesSnapshotFromMember(dbUser.id, member, guildRolesResponse.roles);
  await replaceAuthSessionForUserId(event, dbUser.id);

  return {
    ok: true,
    profileName: dbUser.displayName,
    matchedCommunityRoleIds: matchedMappings.map((entry) => entry.id)
  };
});
