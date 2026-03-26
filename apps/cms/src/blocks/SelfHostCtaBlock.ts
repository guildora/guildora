import type { Block } from "payload";
import { localizedLabel } from "../utils/localization";

export const SelfHostCtaBlock: Block = {
  slug: "self-host-cta",
  labels: {
    singular: localizedLabel("Self-Host CTA", "Self-Host CTA"),
    plural: localizedLabel("Self-Host CTA", "Self-Host CTA")
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: localizedLabel("Titel", "Title")
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      label: localizedLabel("Beschreibung", "Description")
    },
    {
      name: "buttonLabel",
      type: "text",
      localized: true,
      label: localizedLabel("Button-Beschriftung", "Button Label")
    },
    {
      name: "buttonLink",
      type: "text",
      label: localizedLabel("Button-Link", "Button Link")
    },
    {
      name: "showInstallSnippet",
      type: "checkbox",
      defaultValue: false,
      label: localizedLabel("Install-Snippet anzeigen", "Show Install Snippet")
    }
  ]
};
