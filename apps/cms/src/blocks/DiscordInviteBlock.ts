import type { Block } from "payload";
import { localizedLabel } from "../utils/localization";

export const DiscordInviteBlock: Block = {
  slug: "discordInvite",
  labels: {
    singular: localizedLabel("Discord-Einladung", "Discord invite"),
    plural: localizedLabel("Discord-Einladungen", "Discord invites")
  },
  fields: [
    {
      name: "heading",
      type: "text",
      required: true,
      localized: true,
      label: localizedLabel("Überschrift", "Heading")
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      label: localizedLabel("Beschreibung", "Description")
    },
    {
      name: "inviteCode",
      type: "text",
      required: true,
      label: localizedLabel("Invite-Code", "Invite code")
    }
  ]
};
