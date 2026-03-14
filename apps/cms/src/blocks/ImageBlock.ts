import type { Block } from "payload";
import { localizedLabel } from "../utils/localization";

export const ImageBlock: Block = {
  slug: "image",
  labels: {
    singular: localizedLabel("Bild", "Image"),
    plural: localizedLabel("Bilder", "Images")
  },
  fields: [
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      label: localizedLabel("Bild", "Image")
    },
    {
      name: "alt",
      type: "text",
      required: true,
      localized: true,
      label: localizedLabel("Alt-Text", "Alt text")
    },
    {
      name: "caption",
      type: "textarea",
      localized: true,
      label: localizedLabel("Bildunterschrift", "Caption")
    }
  ]
};
