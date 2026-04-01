import { eq } from "drizzle-orm";
import { rolePickerEmbeds } from "@guildora/shared";
import { requireAdminSession } from "../../../../../utils/auth";
import { getDb } from "../../../../../utils/db";
import { deleteRolePickerEmbed } from "../../../../../utils/botSync";

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing group id." });

  const db = getDb();

  const [embed] = await db
    .select()
    .from(rolePickerEmbeds)
    .where(eq(rolePickerEmbeds.groupId, id));

  if (!embed) {
    throw createError({ statusCode: 404, statusMessage: "No embed found for this group." });
  }

  if (embed.discordMessageId) {
    try {
      await deleteRolePickerEmbed(embed.discordChannelId, embed.discordMessageId);
    } catch {
      // Message may already be deleted
    }
  }

  await db.delete(rolePickerEmbeds).where(eq(rolePickerEmbeds.id, embed.id));

  return { ok: true };
});
