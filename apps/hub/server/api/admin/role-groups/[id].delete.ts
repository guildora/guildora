import { eq } from "drizzle-orm";
import { roleGroups, rolePickerEmbeds } from "@guildora/shared";
import { requireAdminSession } from "../../../utils/auth";
import { getDb } from "../../../utils/db";
import { deleteRolePickerEmbed } from "../../../utils/botSync";

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing group id." });

  const db = getDb();

  // Delete embed from Discord if deployed
  const [embed] = await db
    .select()
    .from(rolePickerEmbeds)
    .where(eq(rolePickerEmbeds.groupId, id));

  if (embed?.discordMessageId) {
    try {
      await deleteRolePickerEmbed(embed.discordChannelId, embed.discordMessageId);
    } catch {
      // Embed may already be deleted in Discord — continue
    }
  }

  // Delete group (cascades rolePickerEmbeds, sets groupId=null on selectableDiscordRoles)
  const [deleted] = await db
    .delete(roleGroups)
    .where(eq(roleGroups.id, id))
    .returning();

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: "Role group not found." });
  }

  return { ok: true };
});
