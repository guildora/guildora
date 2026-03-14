import { listActiveCommunityRoleMappings } from "../../../utils/community";
import { fetchDiscordGuildMembersByRoleFromBot, fetchDiscordGuildRolesFromBot } from "../../../utils/botSync";
import { requireAdminSession } from "../../../utils/auth";
import { listOrphanedCandidates, upsertMirroredDiscordMember, wasUserExistingByDiscordId } from "../../../utils/admin-mirror";
import { coerceProfileNameFromRaw } from "@newguildplus/shared";

type ImportAggregation = {
  member: {
    discordId: string;
    displayName: string;
    nickname: string | null;
    avatarUrl: string | null;
    roleIds: string[];
  };
  communityRoleIds: Set<number>;
};

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);

  const mappings = await listActiveCommunityRoleMappings();
  if (mappings.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No active community role mappings found."
    });
  }
  const guildRolesResponse = await fetchDiscordGuildRolesFromBot();
  const guildRoles = guildRolesResponse.roles;

  const importMap = new Map<string, ImportAggregation>();

  for (const mapping of mappings) {
    const response = await fetchDiscordGuildMembersByRoleFromBot(mapping.discordRoleId);
    for (const member of response.members) {
      const existing = importMap.get(member.discordId);
      if (existing) {
        existing.communityRoleIds.add(mapping.id);
      } else {
        importMap.set(member.discordId, {
          member,
          communityRoleIds: new Set([mapping.id])
        });
      }
    }
  }

  const runtime = useRuntimeConfig(event);
  const superadminDiscordId = typeof runtime.superadminDiscordId === "string" ? runtime.superadminDiscordId : null;
  const created: Array<{ userId: string; discordId: string; profileName: string }> = [];
  const updated: Array<{ userId: string; discordId: string; profileName: string }> = [];
  const conflicts: Array<{ discordId: string; profileName: string; communityRoleIds: number[] }> = [];

  for (const [, aggregate] of importMap) {
    const matchedRoles = Array.from(aggregate.communityRoleIds);
    const sourceProfileName = aggregate.member.nickname || aggregate.member.displayName;
    const profileName = coerceProfileNameFromRaw(sourceProfileName, `discord-${aggregate.member.discordId}`);

    if (matchedRoles.length !== 1) {
      conflicts.push({
        discordId: aggregate.member.discordId,
        profileName,
        communityRoleIds: matchedRoles
      });
      continue;
    }

    const existedBefore = await wasUserExistingByDiscordId(aggregate.member.discordId);
    const result = await upsertMirroredDiscordMember(aggregate.member, matchedRoles[0]!, superadminDiscordId, guildRoles);
    if (existedBefore) {
      updated.push({
        userId: result.userId,
        discordId: result.discordId,
        profileName: result.profileName
      });
    } else {
      created.push({
        userId: result.userId,
        discordId: result.discordId,
        profileName: result.profileName
      });
    }
  }

  const validDiscordIds = Array.from(importMap.keys());
  const orphanedCandidates = await listOrphanedCandidates(validDiscordIds);

  return {
    created,
    updated,
    conflicts,
    orphanedCandidates
  };
});
