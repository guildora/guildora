import { requireAdminSession } from "../../../../utils/auth";
import { collectMappedRolesForMember, deleteUsersByIds, isSuperadminUser, listUsersByCommunityRoleId, loadCommunityRoleById, upsertMirroredDiscordMember } from "../../../../utils/admin-mirror";
import { fetchDiscordGuildMemberFromBot, removeDiscordRolesFromBot } from "../../../../utils/botSync";
import { listActiveCommunityRoleMappings } from "../../../../utils/community";
import { requirePositiveIntRouterParam } from "../../../../utils/http";

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);
  const communityRoleId = requirePositiveIntRouterParam(event, "communityRoleId", "Invalid community role id.");

  const role = await loadCommunityRoleById(communityRoleId);
  if (!role) {
    throw createError({ statusCode: 404, statusMessage: "Community role not found." });
  }
  if (!role.discordRoleId) {
    throw createError({ statusCode: 400, statusMessage: "Community role has no mapped Discord role." });
  }

  const usersInRole = await listUsersByCommunityRoleId(communityRoleId);
  const mappings = await listActiveCommunityRoleMappings();
  const runtime = useRuntimeConfig(event);
  const superadminDiscordId = typeof runtime.superadminDiscordId === "string" ? runtime.superadminDiscordId : null;
  const actorIsSuperadmin = await isSuperadminUser(session.user.id);

  let deleted = 0;
  let retained = 0;
  let conflicts = 0;
  let skipped = 0;

  for (const user of usersInRole) {
    const targetIsSuperadmin = await isSuperadminUser(user.id);
    if (targetIsSuperadmin && !actorIsSuperadmin) {
      skipped += 1;
      continue;
    }

    await removeDiscordRolesFromBot(user.discordId, {
      roleIds: [role.discordRoleId],
      removeAllManageable: false
    });

    const memberResponse = await fetchDiscordGuildMemberFromBot(user.discordId);
    if (!memberResponse.member) {
      deleted += await deleteUsersByIds([user.id]);
      continue;
    }

    const matchedMappings = collectMappedRolesForMember(memberResponse.member.roleIds, mappings);
    if (matchedMappings.length === 0) {
      deleted += await deleteUsersByIds([user.id]);
      continue;
    }

    if (matchedMappings.length > 1) {
      conflicts += 1;
      continue;
    }

    await upsertMirroredDiscordMember(memberResponse.member, matchedMappings[0]!.id, superadminDiscordId);
    retained += 1;
  }

  return {
    ok: true,
    deleted,
    retained,
    conflicts,
    skipped
  };
});
