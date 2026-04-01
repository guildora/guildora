import { z } from "zod";
import { eq } from "drizzle-orm";
import { roleGroups, selectableDiscordRoles, rolePickerEmbeds } from "@guildora/shared";
import { requireAdminSession } from "../../../../../utils/auth";
import { getDb } from "../../../../../utils/db";
import { readBodyWithSchema } from "../../../../../utils/http";
import { postRolePickerEmbed, patchRolePickerEmbed } from "../../../../../utils/botSync";

const schema = z.object({
  channelId: z.string().trim().min(1),
  color: z.string().trim().optional()
});

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing group id." });

  const parsed = await readBodyWithSchema(event, schema, "Invalid payload.");
  const db = getDb();

  // Load group + roles
  const [group] = await db
    .select()
    .from(roleGroups)
    .where(eq(roleGroups.id, id));

  if (!group) {
    throw createError({ statusCode: 404, statusMessage: "Role group not found." });
  }

  const roles = await db
    .select()
    .from(selectableDiscordRoles)
    .where(eq(selectableDiscordRoles.groupId, id));

  if (roles.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "No roles assigned to this group." });
  }

  const embedPayload = {
    groupId: id,
    channelId: parsed.channelId,
    title: group.name,
    description: group.description || undefined,
    color: parsed.color,
    roles: roles.map((r) => ({
      discordRoleId: r.discordRoleId,
      emoji: r.emoji,
      roleName: r.roleNameSnapshot
    }))
  };

  // Check if embed already exists
  const [existingEmbed] = await db
    .select()
    .from(rolePickerEmbeds)
    .where(eq(rolePickerEmbeds.groupId, id));

  if (existingEmbed?.discordMessageId) {
    // Update existing embed
    await patchRolePickerEmbed(existingEmbed.discordChannelId, existingEmbed.discordMessageId, embedPayload);

    // Update channel if changed
    if (existingEmbed.discordChannelId !== parsed.channelId) {
      await db
        .update(rolePickerEmbeds)
        .set({ discordChannelId: parsed.channelId })
        .where(eq(rolePickerEmbeds.id, existingEmbed.id));
    }

    return { ok: true, messageId: existingEmbed.discordMessageId, action: "updated" };
  }

  // Create new embed
  const result = await postRolePickerEmbed(embedPayload);
  if (!result) {
    throw createError({ statusCode: 502, statusMessage: "Failed to post embed to Discord." });
  }

  if (existingEmbed) {
    // Update existing DB row with new message ID
    await db
      .update(rolePickerEmbeds)
      .set({
        discordChannelId: parsed.channelId,
        discordMessageId: result.messageId
      })
      .where(eq(rolePickerEmbeds.id, existingEmbed.id));
  } else {
    // Insert new DB row
    await db.insert(rolePickerEmbeds).values({
      groupId: id,
      discordChannelId: parsed.channelId,
      discordMessageId: result.messageId
    });
  }

  return { ok: true, messageId: result.messageId, action: "created" };
});
