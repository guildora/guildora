import { MessageFlags, type ButtonInteraction } from "discord.js";
import { eq, and } from "drizzle-orm";
import { selectableDiscordRoles, userDiscordRoles, users } from "@guildora/shared";
import { getDb } from "../utils/db";
import { logger } from "../utils/logger";

/**
 * Handles role picker button interactions.
 * Button customId format: role_pick_{groupId}_{discordRoleId}
 *
 * Uses deferUpdate() — silently toggles the role without creating any new message.
 * Only sends an ephemeral followUp on errors.
 */
export async function handleRolePickerButtonInteraction(
  interaction: ButtonInteraction
): Promise<void> {
  const customId = interaction.customId;
  if (!customId.startsWith("role_pick_")) return;

  await interaction.deferUpdate();

  const parts = customId.split("_");
  if (parts.length < 4) return;

  const groupId = parts[2]!;
  const discordRoleId = parts[3]!;

  const db = getDb();
  const guildId = interaction.guildId;
  const member = interaction.member;

  if (!guildId || !member || !("roles" in member)) return;

  const [selectableRole] = await db
    .select()
    .from(selectableDiscordRoles)
    .where(
      and(
        eq(selectableDiscordRoles.discordRoleId, discordRoleId),
        eq(selectableDiscordRoles.groupId, groupId)
      )
    )
    .limit(1);

  if (!selectableRole) {
    await interaction.followUp({ content: "This role is no longer available.", flags: MessageFlags.Ephemeral });
    return;
  }

  const memberRoles = member.roles;
  const roleCache = "cache" in memberRoles ? memberRoles.cache : null;
  const hasRole = roleCache?.has(discordRoleId) ?? false;

  const guild = interaction.guild;
  if (!guild) return;

  const guildMember = await guild.members.fetch(interaction.user.id);

  try {
    if (hasRole) {
      await guildMember.roles.remove(discordRoleId);
    } else {
      await guildMember.roles.add(discordRoleId);
    }
  } catch (error) {
    logger.error(`Failed to toggle role ${discordRoleId} for user ${interaction.user.id}:`, error);
    await interaction.followUp({
      content: "Failed to update your role. The bot may not have permission to manage this role.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  // Update DB
  const [dbUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.discordId, interaction.user.id))
    .limit(1);

  if (dbUser) {
    try {
      if (hasRole) {
        await db
          .delete(userDiscordRoles)
          .where(
            and(
              eq(userDiscordRoles.userId, dbUser.id),
              eq(userDiscordRoles.discordRoleId, discordRoleId)
            )
          );
      } else {
        await db
          .insert(userDiscordRoles)
          .values({
            userId: dbUser.id,
            discordRoleId,
            roleNameSnapshot: selectableRole.roleNameSnapshot,
            syncedAt: new Date()
          })
          .onConflictDoUpdate({
            target: [userDiscordRoles.userId, userDiscordRoles.discordRoleId],
            set: { roleNameSnapshot: selectableRole.roleNameSnapshot, syncedAt: new Date() }
          });
      }
    } catch (error) {
      logger.warn(`Failed to sync role to DB for user ${interaction.user.id}:`, error);
    }
  }
}
