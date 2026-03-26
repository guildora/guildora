import type { Client } from "discord.js";
import { botAppHookRegistry } from "../utils/app-hooks";
import { logger } from "../utils/logger";

export function registerGuildMemberAddEvent(client: Client) {
  client.on("guildMemberAdd", async (member) => {
    try {
      await botAppHookRegistry.emit("onMemberJoin", {
        guildId: member.guild.id,
        memberId: member.user.id,
        username: member.user.username,
        joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null
      });
    } catch (error) {
      logger.error("guildMemberAdd handling failed", error);
    }
  });
}
