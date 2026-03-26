import type { Block } from "payload";
import { localizedLabel } from "../utils/localization";

export const HowItWorksBlock: Block = {
  slug: "how-it-works",
  labels: {
    singular: localizedLabel("Wie es funktioniert", "How It Works"),
    plural: localizedLabel("Wie es funktioniert", "How It Works")
  },
  fields: [
    {
      name: "sectionTitle",
      type: "text",
      localized: true,
      label: localizedLabel("Abschnittstitel", "Section Title")
    },
    {
      name: "steps",
      type: "array",
      label: localizedLabel("Schritte", "Steps"),
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
        }
      ]
    }
  ]
};
