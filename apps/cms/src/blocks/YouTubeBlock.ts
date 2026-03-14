import type { Block } from "payload";
import { localizedLabel } from "../utils/localization";

export const YouTubeBlock: Block = {
  slug: "youtube",
  labels: {
    singular: localizedLabel("YouTube", "YouTube"),
    plural: localizedLabel("YouTube", "YouTube")
  },
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
      label: localizedLabel("Titel", "Title")
    },
    {
      name: "videoUrl",
      type: "text",
      required: true,
      label: localizedLabel("Video-URL", "Video URL")
    },
    {
      name: "autoplay",
      type: "checkbox",
      defaultValue: false,
      label: localizedLabel("Autoplay", "Autoplay")
    }
  ]
};
