import { z } from "zod";
import { requireAdminSession } from "../../utils/auth";
import { throwBotBridgeHttpError } from "../../utils/bot-bridge-error";
import { fetchDiscordGuildRolesFromBot } from "../../utils/botSync";
import { saveSelectableDiscordRoleIds } from "../../utils/discord-roles";
import { readBodyWithSchema } from "../../utils/http";

const schema = z.object({
  discordRoleIds: z.array(z.string().trim().min(1)).default([])
});

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const parsed = await readBodyWithSchema(event, schema, "Invalid payload.");
  const selectedRoleIds = Array.from(new Set(parsed.discordRoleIds));

  let guildRolesResponse: Awaited<ReturnType<typeof fetchDiscordGuildRolesFromBot>>;
  try {
    guildRolesResponse = await fetchDiscordGuildRolesFromBot();
  } catch (error) {
    throwBotBridgeHttpError(error);
  }
  const guildRoles = guildRolesResponse.roles;
  const roleById = new Map(guildRoles.map((role) => [role.id, role]));

  const missingRoleIds = selectedRoleIds.filter((roleId) => !roleById.has(roleId));
  if (missingRoleIds.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unknown discord role ids: ${missingRoleIds.join(", ")}`
    });
  }

  const nonEditableRoleIds = selectedRoleIds.filter((roleId) => {
    const role = roleById.get(roleId);
    return !role || !role.editable || role.managed;
  });
  if (nonEditableRoleIds.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Non-editable discord role ids: ${nonEditableRoleIds.join(", ")}`
    });
  }

  await saveSelectableDiscordRoleIds(selectedRoleIds, guildRoles);
  return {
    selectableRoleIds: selectedRoleIds
  };
});
