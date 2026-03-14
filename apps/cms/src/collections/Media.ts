import type { CollectionConfig } from "payload";
import { isAuthenticated } from "../access";
import { localizedLabel } from "../utils/localization";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: localizedLabel("Medium", "Media"),
    plural: localizedLabel("Medien", "Media")
  },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: () => true,
    update: isAuthenticated
  },
  upload: {
    staticDir: "media",
    imageSizes: [
      {
        name: "thumbnail",
        width: 320,
        height: 320,
        fit: "cover"
      },
      {
        name: "card",
        width: 768,
        height: 512,
        fit: "cover"
      }
    ],
    adminThumbnail: "thumbnail"
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      localized: true,
      label: localizedLabel("Alt-Text", "Alt text")
    }
  ]
};
