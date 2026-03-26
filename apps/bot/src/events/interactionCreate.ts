import type { ChatInputCommandInteraction, Client, Collection } from "discord.js";
import { getBotMessages, interpolate, resolveBotLocale } from "../i18n/messages";
import type { BotCommand } from "../types";
import { botAppHookRegistry } from "../utils/app-hooks";
import { logger } from "../utils/logger";

export function registerInteractionCreateEvent(
  client: Client,
  commands: Collection<string, BotCommand>
) {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    await executeCommand(interaction, commands);
  });
}

async function executeCommand(
  interaction: ChatInputCommandInteraction,
  commands: Collection<string, BotCommand>
) {
  const locale = resolveBotLocale(interaction.locale || interaction.guildLocale);
  const messages = getBotMessages(locale);

  await botAppHookRegistry.emit("onInteraction", {
    guildId: interaction.guildId,
    memberId: interaction.user.id,
    commandName: interaction.commandName,
    channelId: interaction.channelId,
    occurredAt: new Date().toISOString()
  });

  const command = commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      ephemeral: true,
      content: interpolate(messages.interaction.unknownCommand, { commandName: interaction.commandName })
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Command execution failed (${interaction.commandName})`, error);
    if (!interaction.replied) {
      await interaction.reply({
        ephemeral: true,
        content: messages.interaction.commandFailed
      });
    }
  }
}
