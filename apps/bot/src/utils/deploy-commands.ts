import "dotenv/config";
import { REST, Routes } from "discord.js";
import { setupCommand } from "../commands/setup";
import { logger } from "./logger";

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId || !guildId) {
  throw new Error("DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID and DISCORD_GUILD_ID are required.");
}

const rest = new REST({ version: "10" }).setToken(token);
const commands = [setupCommand].map((command) => command.data.toJSON());

async function main() {
  await rest.put(Routes.applicationGuildCommands(clientId!, guildId!), {
    body: commands
  });

  logger.info(`Registered ${commands.length} slash commands for guild ${guildId!}.`);
}

main().catch((error) => {
  logger.error("Failed to deploy slash commands.", error);
  process.exit(1);
});
