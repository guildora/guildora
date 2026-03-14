import { BotBridgeError } from "./botSync";

export function throwBotBridgeHttpError(error: unknown): never {
  if (error instanceof BotBridgeError) {
    throw createError({
      statusCode: error.statusCode ?? 503,
      statusMessage: "BOT_BRIDGE_ERROR",
      data: {
        code: error.code,
        message: error.message
      }
    });
  }

  const message = error instanceof Error ? error.message : String(error);
  throw createError({
    statusCode: 503,
    statusMessage: "BOT_BRIDGE_ERROR",
    data: {
      code: "UNKNOWN",
      message
    }
  });
}
