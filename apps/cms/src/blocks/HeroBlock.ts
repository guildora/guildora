import type { Block } from "payload";
import { localizedLabel } from "../utils/localization";

export const HeroBlock: Block = {
  slug: "hero",
  labels: {
    singular: localizedLabel("Hero", "Hero"),
    plural: localizedLabel("Hero", "Hero")
  },
  fields: [
    {
      name: "eyebrowLabel",
      type: "text",
      localized: true,
      label: localizedLabel("Eyebrow-Label", "Eyebrow Label")
    },
    {
      name: "heading",
      type: "text",
      required: true,
      localized: true,
      label: localizedLabel("Überschrift", "Heading")
    },
    {
      name: "subheading",
      type: "textarea",
      localized: true,
      label: localizedLabel("Unterüberschrift", "Subheading")
    },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      label: localizedLabel("Hintergrundbild", "Background image")
    },
    {
      name: "ctaText",
      type: "text",
      localized: true,
      label: localizedLabel("CTA-Text", "CTA text")
    },
    {
      name: "ctaLink",
      type: "text",
      label: localizedLabel("CTA-Link", "CTA link")
    },
    {
      name: "ctaExploreLabel",
      type: "text",
      localized: true,
      label: localizedLabel("Explore-Button-Beschriftung", "Explore CTA Label")
    },
    {
      name: "ctaGithubLabel",
      type: "text",
      localized: true,
      label: localizedLabel("GitHub-Button-Beschriftung", "GitHub CTA Label")
    }
  ]
};
