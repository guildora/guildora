import type { Client } from "discord.js";
import { logger } from "../utils/logger";
import { startVoiceSessionReconcileLoop } from "../utils/voice-reconcile";

export function registerReadyEvent(client: Client) {
  client.once("ready", () => {
    logger.info(`Discord bot connected as ${client.user?.tag ?? "unknown user"}.`);
    startVoiceSessionReconcileLoop(client);
  });
}
