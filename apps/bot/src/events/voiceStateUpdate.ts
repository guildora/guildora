import type { Client, VoiceState } from "discord.js";
import { getDb } from "../utils/db";
import { getUserByDiscordId } from "../utils/community";
import { botAppHookRegistry } from "../utils/app-hooks";
import { logger } from "../utils/logger";
import { closeIfOpen, isRegularVoiceChannel, splitOnChannelMismatch } from "../utils/voice-session-lifecycle";

function isBotUser(oldState: VoiceState, newState: VoiceState) {
  return Boolean(oldState.member?.user?.bot || newState.member?.user?.bot);
}

export function registerVoiceStateUpdateEvent(client: Client) {
  client.on("voiceStateUpdate", async (oldState, newState) => {
    try {
      if (isBotUser(oldState, newState)) {
        return;
      }

      const oldChannelId = oldState.channelId;
      const newChannelId = newState.channelId;
      if (oldChannelId === newChannelId) {
        return;
      }

      const afkChannelId = process.env.AFK_VOICE_CHANNEL_ID || null;
      const discordId = newState.id || oldState.id;
      if (!discordId) {
        return;
      }

      const user = await getUserByDiscordId(discordId);
      if (!user) {
        return;
      }

      const db = getDb();
      const now = new Date();

      const leftRegular = isRegularVoiceChannel(oldChannelId, afkChannelId);
      const joinedRegular = isRegularVoiceChannel(newChannelId, afkChannelId);

      if (leftRegular && joinedRegular && newChannelId) {
        await splitOnChannelMismatch(db, user.id, newChannelId, now);
      } else if (leftRegular) {
        await closeIfOpen(db, user.id, now);
      } else if (joinedRegular && newChannelId) {
        await splitOnChannelMismatch(db, user.id, newChannelId, now);
      }

      if (oldState.guild?.id) {
        const eventType = !oldChannelId && newChannelId ? "joined" : oldChannelId && !newChannelId ? "left" : "moved";
        await botAppHookRegistry.emit("onVoiceActivity", {
          guildId: oldState.guild.id,
          userId: discordId,
          oldChannelId: oldChannelId || null,
          newChannelId: newChannelId || null,
          eventType,
          occurredAt: now.toISOString()
        });
      }
    } catch (error) {
      logger.error("voiceStateUpdate handling failed", error);
    }
  });
}
