import { eq } from "drizzle-orm";
import { users } from "@newguildplus/shared";
import { z } from "zod";
import { requireSession } from "../../utils/auth";
import { throwBotBridgeHttpError } from "../../utils/bot-bridge-error";
import { fetchDiscordGuildRolesFromBot, syncDiscordCommunityRolesFromBot } from "../../utils/botSync";
import {
  buildEditableDiscordRolesForUser,
  createDiscordRoleNameMap,
  listSelectableDiscordRoleRows,
  replaceUserDiscordRolesSnapshot
} from "../../utils/discord-roles";
import { getDb } from "../../utils/db";
import { readBodyWithSchema } from "../../utils/http";
import { jsonResponse } from "../../utils/jsonResponse";

const schema = z.object({
  discordRoleIds: z.array(z.string().trim().min(1)).default([])
});

export default defineEventHandler(async (event) => {
  const session = await requireSession(event);
  const parsed = await readBodyWithSchema(event, schema, "Invalid discord roles payload.");
  const selectedRoleIds = Array.from(new Set(parsed.discordRoleIds));

  const db = getDb();
  const userRows = await db.select({ discordId: users.discordId }).from(users).where(eq(users.id, session.user.id)).limit(1);
  const userRow = userRows[0];
  if (!userRow) {
    throw createError({ statusCode: 404, statusMessage: "User not found." });
  }

  const selectableRows = await listSelectableDiscordRoleRows();
  const allowedRoleIds = selectableRows.map((row) => row.discordRoleId);
  const allowedRoleSet = new Set(allowedRoleIds);
  const invalidRoleIds = selectedRoleIds.filter((roleId) => !allowedRoleSet.has(roleId));
  if (invalidRoleIds.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Roles not allowed for self-assign: ${invalidRoleIds.join(", ")}`
    });
  }

  let guildRolesResponse: Awaited<ReturnType<typeof fetchDiscordGuildRolesFromBot>>;
  let syncResult: Awaited<ReturnType<typeof syncDiscordCommunityRolesFromBot>>;
  try {
    [guildRolesResponse, syncResult] = await Promise.all([
      fetchDiscordGuildRolesFromBot(),
      syncDiscordCommunityRolesFromBot(userRow.discordId, {
        allowedRoleIds,
        selectedRoleIds
      })
    ]);
  } catch (error) {
    throwBotBridgeHttpError(error);
  }

  await replaceUserDiscordRolesSnapshot(
    session.user.id,
    syncResult.currentRoleIds,
    createDiscordRoleNameMap(guildRolesResponse.roles)
  );

  return jsonResponse({
    editableDiscordRoles: await buildEditableDiscordRolesForUser(session.user.id),
    addedRoleIds: syncResult.addedRoleIds,
    removedRoleIds: syncResult.removedRoleIds
  });
});
