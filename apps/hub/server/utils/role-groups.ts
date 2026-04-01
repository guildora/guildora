import { asc, eq, isNotNull } from "drizzle-orm";
import { roleGroups, selectableDiscordRoles, rolePickerEmbeds } from "@guildora/shared";
import type { RoleGroup } from "@guildora/shared";
import { getDb } from "./db";

export async function listRoleGroupsWithRoles(): Promise<RoleGroup[]> {
  const db = getDb();

  const [groups, roles, embeds] = await Promise.all([
    db.select().from(roleGroups).orderBy(asc(roleGroups.sortOrder), asc(roleGroups.name)),
    db
      .select()
      .from(selectableDiscordRoles)
      .where(isNotNull(selectableDiscordRoles.groupId))
      .orderBy(asc(selectableDiscordRoles.sortOrder)),
    db.select().from(rolePickerEmbeds)
  ]);

  const embedByGroupId = new Map(embeds.map((e) => [e.groupId, e]));

  return groups.map((group) => {
    const groupRoles = roles.filter((r) => r.groupId === group.id);
    const embed = embedByGroupId.get(group.id);
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      sortOrder: group.sortOrder,
      roles: groupRoles.map((r) => ({
        discordRoleId: r.discordRoleId,
        roleNameSnapshot: r.roleNameSnapshot,
        emoji: r.emoji,
        sortOrder: r.sortOrder
      })),
      embed: embed
        ? {
            id: embed.id,
            channelId: embed.discordChannelId,
            messageId: embed.discordMessageId
          }
        : null
    };
  });
}

export async function upsertGroupRoles(
  groupId: string,
  roles: Array<{ discordRoleId: string; emoji: string | null; sortOrder: number }>
) {
  const db = getDb();

  // Clear existing group assignments for this group
  const existing = await db
    .select({ discordRoleId: selectableDiscordRoles.discordRoleId })
    .from(selectableDiscordRoles)
    .where(eq(selectableDiscordRoles.groupId, groupId));

  for (const row of existing) {
    await db
      .update(selectableDiscordRoles)
      .set({ groupId: null, emoji: null, sortOrder: 0 })
      .where(eq(selectableDiscordRoles.discordRoleId, row.discordRoleId));
  }

  // Assign roles to this group
  for (const role of roles) {
    await db
      .update(selectableDiscordRoles)
      .set({ groupId, emoji: role.emoji, sortOrder: role.sortOrder })
      .where(eq(selectableDiscordRoles.discordRoleId, role.discordRoleId));
  }
}
