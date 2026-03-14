import type { Block } from "payload";
import { localizedLabel } from "../utils/localization";

export const CTABlock: Block = {
  slug: "cta",
  labels: {
    singular: localizedLabel("CTA", "CTA"),
    plural: localizedLabel("CTA", "CTA")
  },
  fields: [
    {
      name: "heading",
      type: "text",
      required: true,
      localized: true,
      label: localizedLabel("Überschrift", "Heading")
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      label: localizedLabel("Beschreibung", "Description")
    },
    {
      name: "buttonText",
      type: "text",
      required: true,
      localized: true,
      label: localizedLabel("Button-Text", "Button text")
    },
    {
      name: "buttonLink",
      type: "text",
      required: true,
      label: localizedLabel("Button-Link", "Button link")
    },
    {
      name: "variant",
      type: "select",
      defaultValue: "primary",
      label: localizedLabel("Variante", "Variant"),
      options: [
        { label: localizedLabel("Primär", "Primary"), value: "primary" },
        { label: localizedLabel("Sekundär", "Secondary"), value: "secondary" },
        { label: localizedLabel("Akzent", "Accent"), value: "accent" }
      ]
    }
  ]
};
