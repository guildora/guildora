import type { ChatInputCommandInteraction, Client, Collection } from "discord.js";
import { getBotMessages, interpolate, resolveBotLocale } from "../i18n/messages";
import type { BotCommand } from "../types";
import { botAppHookRegistry } from "../utils/app-hooks";
import { handleApplicationButtonInteraction } from "../interactions/application-button";
import { handleRolePickerButtonInteraction } from "../interactions/role-picker-button";
import { logger } from "../utils/logger";

export function registerInteractionCreateEvent(
  client: Client,
  commands: Collection<string, BotCommand>
) {
  client.on("interactionCreate", async (interaction) => {
    // Handle button interactions for application embeds
    if (interaction.isButton()) {
      if (interaction.customId.startsWith("application_apply_")) {
        try {
          await handleApplicationButtonInteraction(interaction, client);
        } catch (error) {
          logger.error("Application button interaction failed.", error);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ ephemeral: true, content: "An error occurred. Please try again." }).catch(() => {});
          }
        }
        return;
      }
      if (interaction.customId.startsWith("role_pick_")) {
        try {
          await handleRolePickerButtonInteraction(interaction);
        } catch (error) {
          logger.error("Role picker button interaction failed.", error);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ ephemeral: true, content: "An error occurred. Please try again." }).catch(() => {});
          }
        }
        return;
      }
      return;
    }

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
