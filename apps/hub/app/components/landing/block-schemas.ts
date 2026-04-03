export type FieldType = "text" | "textarea" | "url" | "select" | "array";

export interface BlockField {
  key: string;
  type: FieldType;
  labelKey: string;
  required?: boolean;
  options?: { value: string; labelKey: string }[];
  itemFields?: BlockField[];
}

export const blockSchemas: Record<string, BlockField[]> = {
  hero: [
    { key: "heading", type: "text", labelKey: "landingBlocks.hero.heading", required: true },
    { key: "subheading", type: "textarea", labelKey: "landingBlocks.hero.subheading" },
    { key: "eyebrowLabel", type: "text", labelKey: "landingBlocks.hero.eyebrowLabel" },
    { key: "backgroundImage", type: "url", labelKey: "landingBlocks.hero.backgroundImage" },
    { key: "ctaText", type: "text", labelKey: "landingBlocks.hero.ctaText" },
    { key: "ctaLink", type: "url", labelKey: "landingBlocks.hero.ctaLink" },
    { key: "ctaExploreLabel", type: "text", labelKey: "landingBlocks.hero.ctaExploreLabel" },
  ],
  features: [
    { key: "sectionTitle", type: "text", labelKey: "landingBlocks.common.sectionTitle" },
    {
      key: "features",
      type: "array",
      labelKey: "landingBlocks.features.items",
      itemFields: [
        { key: "icon", type: "text", labelKey: "landingBlocks.features.icon" },
        { key: "title", type: "text", labelKey: "landingBlocks.features.title", required: true },
        { key: "description", type: "textarea", labelKey: "landingBlocks.features.description" },
      ],
    },
  ],
  "how-it-works": [
    { key: "sectionTitle", type: "text", labelKey: "landingBlocks.common.sectionTitle" },
    {
      key: "steps",
      type: "array",
      labelKey: "landingBlocks.howItWorks.steps",
      itemFields: [
        { key: "title", type: "text", labelKey: "landingBlocks.howItWorks.stepTitle", required: true },
        { key: "description", type: "textarea", labelKey: "landingBlocks.howItWorks.stepDescription" },
      ],
    },
  ],
  cta: [
    { key: "heading", type: "text", labelKey: "landingBlocks.cta.heading", required: true },
    { key: "description", type: "textarea", labelKey: "landingBlocks.cta.description" },
    { key: "buttonText", type: "text", labelKey: "landingBlocks.cta.buttonText" },
    { key: "buttonLink", type: "url", labelKey: "landingBlocks.cta.buttonLink" },
    {
      key: "variant",
      type: "select",
      labelKey: "landingBlocks.cta.variant",
      options: [
        { value: "default", labelKey: "landingBlocks.cta.variantDefault" },
        { value: "accent", labelKey: "landingBlocks.cta.variantAccent" },
        { value: "secondary", labelKey: "landingBlocks.cta.variantSecondary" },
      ],
    },
  ],
  "rich-text": [
    { key: "title", type: "text", labelKey: "landingBlocks.richText.title" },
    { key: "body", type: "textarea", labelKey: "landingBlocks.richText.body" },
  ],
  gallery: [
    {
      key: "images",
      type: "array",
      labelKey: "landingBlocks.gallery.images",
      itemFields: [
        { key: "url", type: "url", labelKey: "landingBlocks.gallery.imageUrl", required: true },
        { key: "alt", type: "text", labelKey: "landingBlocks.gallery.imageAlt" },
      ],
    },
  ],
  youtube: [
    { key: "title", type: "text", labelKey: "landingBlocks.youtube.title" },
    { key: "videoUrl", type: "url", labelKey: "landingBlocks.youtube.videoUrl", required: true },
  ],
  "discord-invite": [
    { key: "heading", type: "text", labelKey: "landingBlocks.discordInvite.heading" },
    { key: "description", type: "textarea", labelKey: "landingBlocks.discordInvite.description" },
    { key: "inviteCode", type: "text", labelKey: "landingBlocks.discordInvite.inviteCode" },
  ],
  testimonials: [
    { key: "sectionTitle", type: "text", labelKey: "landingBlocks.common.sectionTitle" },
    {
      key: "testimonials",
      type: "array",
      labelKey: "landingBlocks.testimonials.items",
      itemFields: [
        { key: "quote", type: "textarea", labelKey: "landingBlocks.testimonials.quote", required: true },
        { key: "name", type: "text", labelKey: "landingBlocks.testimonials.name", required: true },
        { key: "role", type: "text", labelKey: "landingBlocks.testimonials.role" },
        { key: "avatarUrl", type: "url", labelKey: "landingBlocks.testimonials.avatarUrl" },
      ],
    },
  ],
  stats: [
    { key: "sectionTitle", type: "text", labelKey: "landingBlocks.common.sectionTitle" },
    {
      key: "stats",
      type: "array",
      labelKey: "landingBlocks.stats.items",
      itemFields: [
        { key: "value", type: "text", labelKey: "landingBlocks.stats.value", required: true },
        { key: "label", type: "text", labelKey: "landingBlocks.stats.label", required: true },
      ],
    },
  ],
  faq: [
    { key: "sectionTitle", type: "text", labelKey: "landingBlocks.common.sectionTitle" },
    {
      key: "items",
      type: "array",
      labelKey: "landingBlocks.faq.items",
      itemFields: [
        { key: "question", type: "text", labelKey: "landingBlocks.faq.question", required: true },
        { key: "answer", type: "textarea", labelKey: "landingBlocks.faq.answer", required: true },
      ],
    },
  ],
  team: [
    { key: "sectionTitle", type: "text", labelKey: "landingBlocks.common.sectionTitle" },
    {
      key: "members",
      type: "array",
      labelKey: "landingBlocks.team.members",
      itemFields: [
        { key: "name", type: "text", labelKey: "landingBlocks.team.name", required: true },
        { key: "role", type: "text", labelKey: "landingBlocks.team.role" },
        { key: "avatarUrl", type: "url", labelKey: "landingBlocks.team.avatarUrl" },
      ],
    },
  ],
  applications: [
    { key: "heading", type: "text", labelKey: "landingBlocks.applications.heading", required: true },
    { key: "description", type: "textarea", labelKey: "landingBlocks.applications.description" },
    { key: "buttonText", type: "text", labelKey: "landingBlocks.applications.buttonText" },
    { key: "customLink", type: "url", labelKey: "landingBlocks.applications.customLink" },
  ],
};
