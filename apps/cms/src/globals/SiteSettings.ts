import type { GlobalConfig } from "payload";
import { isModeratorOrAdmin } from "../access";
import { localizedLabel } from "../utils/localization";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: localizedLabel("Seiteneinstellungen", "Site Settings"),
  access: {
    read: () => true,
    update: isModeratorOrAdmin
  },
  fields: [
    {
      name: "siteName",
      type: "text",
      required: true,
      localized: true,
      label: localizedLabel("Seitenname", "Site name")
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: localizedLabel("Logo", "Logo")
    },
    {
      name: "footerText",
      type: "textarea",
      localized: true,
      label: localizedLabel("Footer-Text", "Footer text")
    },
    {
      name: "socialLinks",
      type: "array",
      label: localizedLabel("Social Links", "Social links"),
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          localized: true,
          label: localizedLabel("Label", "Label")
        },
        {
          name: "url",
          type: "text",
          required: true,
          label: localizedLabel("URL", "URL")
        }
      ]
    }
  ]
};
