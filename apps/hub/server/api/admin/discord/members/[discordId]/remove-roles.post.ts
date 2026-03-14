import { z } from "zod";
import { requireAdminSession } from "../../../../../utils/auth";
import { throwBotBridgeHttpError } from "../../../../../utils/bot-bridge-error";
import { removeDiscordRolesFromBot } from "../../../../../utils/botSync";
import { readBodyWithSchema, requireRouterParam } from "../../../../../utils/http";

const schema = z.object({
  roleIds: z.array(z.string().min(1)).default([]),
  removeAllManageable: z.boolean().default(false)
});

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);
  const discordId = requireRouterParam(event, "discordId", "Missing discord id.");
  const parsed = await readBodyWithSchema(event, schema, "Invalid payload.", { emptyBodyValue: {} });

  if (!parsed.removeAllManageable && parsed.roleIds.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Missing roleIds." });
  }

  try {
    return await removeDiscordRolesFromBot(discordId, parsed);
  } catch (error) {
    throwBotBridgeHttpError(error);
  }
});
