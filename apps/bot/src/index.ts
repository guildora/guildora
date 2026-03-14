import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Client, Collection, GatewayIntentBits } from "discord.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import type { BotCommand } from "./types";
import { setupCommand } from "./commands/setup";
import { registerGuildMemberAddEvent } from "./events/guildMemberAdd";
import { registerInteractionCreateEvent } from "./events/interactionCreate";
import { registerReadyEvent } from "./events/ready";
import { registerVoiceStateUpdateEvent } from "./events/voiceStateUpdate";
import { loadInstalledAppHooks } from "./utils/app-hooks";
import { ensureBaseRoles } from "./utils/community";
import { startInternalSyncServer } from "./utils/internal-sync-server";
import { logger } from "./utils/logger";

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  throw new Error("DISCORD_BOT_TOKEN is required.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates]
});

const commands = new Collection<string, BotCommand>();
for (const command of [setupCommand]) {
  commands.set(command.data.name, command);
}

registerReadyEvent(client);
registerInteractionCreateEvent(client, commands);
registerGuildMemberAddEvent(client);
registerVoiceStateUpdateEvent(client);

ensureBaseRoles()
  .then(() => logger.info("Base roles ensured."))
  .catch((error) => logger.error("Role initialization failed.", error));

loadInstalledAppHooks()
  .then(() => logger.info("App hooks loaded."))
  .catch((error) => logger.error("App hook loading failed.", error));

startInternalSyncServer(client);

client.login(token).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("disallowed intents")) {
    logger.error(
      "Discord login failed: Privileged Intents sind nicht aktiviert. " +
        "Im Discord Developer Portal (https://discord.com/developers/applications) → deine App → Bot → " +
        "„Privileged Gateway Intents“: „SERVER MEMBERS INTENT“ und ggf. „PRESENCE INTENT“ aktivieren."
    );
  } else {
    logger.error("Discord login failed.", error);
  }
  process.exit(1);
});
