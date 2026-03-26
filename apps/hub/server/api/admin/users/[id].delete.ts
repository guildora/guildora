import { eq } from "drizzle-orm";
import { communityRoles, userCommunityRoles, users } from "@guildora/shared";
import { z } from "zod";
import { requireAdminSession } from "../../../utils/auth";
import {
  collectMappedRolesForMember,
  deleteUsersByIds,
  isSuperadminUser,
  upsertMirroredDiscordMember
} from "../../../utils/admin-mirror";
import {
  fetchDiscordGuildMemberFromBot,
  removeDiscordRolesFromBot
} from "../../../utils/botSync";
import { listActiveCommunityRoleMappings } from "../../../utils/community";
import { getDb } from "../../../utils/db";
import { readBodyWithSchema, requireRouterParam } from "../../../utils/http";

const schema = z.object({
  removeAllDiscordRoles: z.boolean().default(false)
});

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);
  const userId = requireRouterParam(event, "id", "Missing user id.");
  if (userId === session.user.id) {
    throw createError({ statusCode: 400, statusMessage: "You cannot delete your own account." });
  }

  const parsed = await readBodyWithSchema(event, schema, "Invalid payload.", { emptyBodyValue: {} });

  const db = getDb();
  const targetRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const targetUser = targetRows[0];
  if (!targetUser) {
    throw createError({ statusCode: 404, statusMessage: "User not found." });
  }

  const targetIsSuperadmin = await isSuperadminUser(userId);
  const actorIsSuperadmin = await isSuperadminUser(session.user.id);
  if (targetIsSuperadmin && !actorIsSuperadmin) {
    throw createError({ statusCode: 403, statusMessage: "Only superadmins can delete superadmin accounts." });
  }

  const assignmentRows = await db
    .select({
      discordRoleId: communityRoles.discordRoleId
    })
    .from(userCommunityRoles)
    .innerJoin(communityRoles, eq(userCommunityRoles.communityRoleId, communityRoles.id))
    .where(eq(userCommunityRoles.userId, userId));

  const roleIdsToRemove = assignmentRows
    .map((row) => row.discordRoleId)
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (parsed.removeAllDiscordRoles || roleIdsToRemove.length > 0) {
    await removeDiscordRolesFromBot(targetUser.discordId, {
      removeAllManageable: parsed.removeAllDiscordRoles,
      roleIds: roleIdsToRemove
    });
  }

  const memberResponse = await fetchDiscordGuildMemberFromBot(targetUser.discordId);
  if (!memberResponse.member) {
    const deleted = await deleteUsersByIds([userId]);
    return { ok: true, deleted, action: "deleted" };
  }

  const mappings = await listActiveCommunityRoleMappings();
  const matchedMappings = collectMappedRolesForMember(memberResponse.member.roleIds, mappings);

  if (matchedMappings.length === 0) {
    const deleted = await deleteUsersByIds([userId]);
    return { ok: true, deleted, action: "deleted" };
  }

  if (matchedMappings.length > 1) {
    throw createError({
      statusCode: 409,
      statusMessage: "Member has multiple mapped community roles after reconciliation."
    });
  }

  const runtime = useRuntimeConfig(event);
  const superadminDiscordId = typeof runtime.superadminDiscordId === "string" ? runtime.superadminDiscordId : null;
  await upsertMirroredDiscordMember(memberResponse.member, matchedMappings[0]!.id, superadminDiscordId);
  return {
    ok: true,
    deleted: 0,
    action: "retained",
    mappedCommunityRoleId: matchedMappings[0]!.id
  };
});
