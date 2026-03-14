import type { Block } from "payload";
import { localizedLabel } from "../utils/localization";

export const GalleryBlock: Block = {
  slug: "gallery",
  labels: {
    singular: localizedLabel("Galerie", "Gallery"),
    plural: localizedLabel("Galerien", "Galleries")
  },
  fields: [
    {
      name: "layout",
      type: "select",
      defaultValue: "grid",
      label: localizedLabel("Layout", "Layout"),
      options: [
        { label: localizedLabel("Raster", "Grid"), value: "grid" },
        { label: localizedLabel("Karussell", "Carousel"), value: "carousel" }
      ]
    },
    {
      name: "images",
      type: "array",
      minRows: 1,
      label: localizedLabel("Bilder", "Images"),
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
        }
      ]
    }
  ]
};
