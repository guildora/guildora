import type { Block } from "payload";
import { localizedLabel } from "../utils/localization";

export const FeaturesBlock: Block = {
  slug: "features",
  labels: {
    singular: localizedLabel("Features", "Features"),
    plural: localizedLabel("Features", "Features")
  },
  fields: [
    {
      name: "sectionTitle",
      type: "text",
      localized: true,
      label: localizedLabel("Abschnittstitel", "Section Title")
    },
    {
      name: "features",
      type: "array",
      label: localizedLabel("Features", "Features"),
      fields: [
        {
          name: "icon",
          type: "text",
          label: localizedLabel("Icon (Emoji)", "Icon (Emoji)")
        },
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
