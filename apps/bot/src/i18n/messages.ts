export type BotLocale = "de" | "en";

const botMessages = {
  en: {
    command: {
      setupDescription: "Post or update the Guildora info embed",
      channelOptionName: "channel",
      channelOptionDescription: "Target channel for the info embed",
      setupNameLocalization: "setup",
      setupDescriptionLocalization: "Post or update the Guildora info embed",
      channelOptionNameLocalization: "channel",
      channelOptionDescriptionLocalization: "Target channel for the info embed"
    },
    interaction: {
      unknownCommand: "Unknown command: {commandName}",
      commandFailed: "Command failed."
    },
    setup: {
      serverOnly: "This command can only run in a server.",
      missingAdminPermission: "You need administrator permission to run setup helpers.",
      invalidChannel: "Please run this command in a text channel or provide one via the channel option.",
      embedTitle: "Guildora - Website as central platform",
      embedDescription:
        "Profile data, absences, and community administration are managed centrally through the website.\n\nDiscord is used for OAuth login and technical synchronization.",
      loginFieldName: "Login",
      loginFieldValue: "If no session exists, opening the dashboard automatically starts Discord login.",
      profileFieldName: "Profile management",
      profileFieldValue: "Update display name, call name, and absences in the internal profile area.",
      hintFieldName: "Note",
      hintFieldValue: "Discord commands are not the primary product workflow.",
      buttonLabel: "Open internal area",
      successReply: "Info embed was created in <#{channelId}> (Message ID: {messageId})."
    }
  },
  de: {
    command: {
      setupDescription: "Erstellt oder aktualisiert das Guildora-Info-Embed",
      channelOptionName: "channel",
      channelOptionDescription: "Zielkanal für das Info-Embed",
      setupNameLocalization: "einrichten",
      setupDescriptionLocalization: "Erstellt oder aktualisiert das Guildora-Info-Embed",
      channelOptionNameLocalization: "kanal",
      channelOptionDescriptionLocalization: "Zielkanal für das Info-Embed"
    },
    interaction: {
      unknownCommand: "Unbekannter Command: {commandName}",
      commandFailed: "Befehl fehlgeschlagen."
    },
    setup: {
      serverOnly: "Dieser Befehl kann nur auf einem Server ausgeführt werden.",
      missingAdminPermission: "Du brauchst Administrator-Rechte, um den Setup-Helper zu nutzen.",
      invalidChannel: "Bitte führe den Befehl in einem Textkanal aus oder gib einen Kanal über die Option an.",
      embedTitle: "Guildora - Website als zentrale Plattform",
      embedDescription:
        "Profildaten, Abwesenheiten und Community-Verwaltung laufen zentral über die Website.\n\nDiscord dient für OAuth-Login und technische Synchronisierung.",
      loginFieldName: "Login",
      loginFieldValue: "Wenn keine Session besteht, startet beim Öffnen des Dashboards automatisch der Discord-Login.",
      profileFieldName: "Profilpflege",
      profileFieldValue: "Passe Anzeigename, Rufname und Abwesenheit im internen Profilbereich an.",
      hintFieldName: "Hinweis",
      hintFieldValue: "Discord-Commands sind nicht der primäre Produkt-Workflow.",
      buttonLabel: "Zum internen Bereich",
      successReply: "Info-Embed wurde in <#{channelId}> erstellt (Message ID: {messageId})."
    }
  }
} as const;

export function resolveBotLocale(locale?: string | null): BotLocale {
  const normalized = String(locale || "").toLowerCase();
  return normalized.startsWith("de") ? "de" : "en";
}

export function getBotMessages(locale: BotLocale) {
  return botMessages[locale];
}

export function interpolate(message: string, values: Record<string, string>) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, value), message);
}
