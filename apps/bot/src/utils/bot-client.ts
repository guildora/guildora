import type { Client } from "discord.js";
import type { BotClient } from "@guildora/app-sdk";
import { logger } from "./logger";

export function createBotClient(client: Client): BotClient {
  return {
    async sendMessage(channelId: string, content: string): Promise<void> {
      try {
        const channel = await client.channels.fetch(channelId);
        if (!channel || !("send" in channel) || typeof (channel as { send?: unknown }).send !== "function") {
          logger.warn(`[bot-client] Channel ${channelId} not found or not sendable.`);
          return;
        }
        await (channel as { send(content: string): Promise<unknown> }).send(content);
      } catch (err) {
        logger.error(`[bot-client] Failed to send message to ${channelId}`, err);
      }
    }
  };
}
