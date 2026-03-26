import type { Block } from "payload";
import { localizedLabel } from "../utils/localization";

export const MarketplaceTeaserBlock: Block = {
  slug: "marketplace-teaser",
  labels: {
    singular: localizedLabel("Marketplace Teaser", "Marketplace Teaser"),
    plural: localizedLabel("Marketplace Teaser", "Marketplace Teaser")
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
      name: "ctaLabel",
      type: "text",
      localized: true,
      label: localizedLabel("CTA-Beschriftung", "CTA Label")
    },
    {
      name: "ctaLink",
      type: "text",
      label: localizedLabel("CTA-Link", "CTA Link")
    }
  ]
};
