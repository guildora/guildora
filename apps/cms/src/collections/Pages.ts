import type { CollectionConfig } from "payload";
import { isModeratorOrAdmin } from "../access";
import { CTABlock } from "../blocks/CTABlock";
import { DiscordInviteBlock } from "../blocks/DiscordInviteBlock";
import { FeaturesBlock } from "../blocks/FeaturesBlock";
import { GalleryBlock } from "../blocks/GalleryBlock";
import { HeroBlock } from "../blocks/HeroBlock";
import { HowItWorksBlock } from "../blocks/HowItWorksBlock";
import { ImageBlock } from "../blocks/ImageBlock";
import { MarketplaceTeaserBlock } from "../blocks/MarketplaceTeaserBlock";
import { RichTextBlock } from "../blocks/RichTextBlock";
import { SelfHostCtaBlock } from "../blocks/SelfHostCtaBlock";
import { localizedLabel } from "../utils/localization";
import { YouTubeBlock } from "../blocks/YouTubeBlock";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: {
    singular: localizedLabel("Seite", "Page"),
    plural: localizedLabel("Seiten", "Pages")
  },
  admin: {
    useAsTitle: "title"
  },
  access: {
    read: () => true,
    create: isModeratorOrAdmin,
    update: isModeratorOrAdmin,
    delete: isModeratorOrAdmin
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
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: localizedLabel("Slug", "Slug")
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      label: localizedLabel("Status", "Status"),
      options: [
        { label: localizedLabel("Entwurf", "Draft"), value: "draft" },
        { label: localizedLabel("Veröffentlicht", "Published"), value: "published" }
      ]
    },
    {
      name: "layout",
      type: "blocks",
      label: localizedLabel("Layout", "Layout"),
      blocks: [HeroBlock, FeaturesBlock, HowItWorksBlock, MarketplaceTeaserBlock, SelfHostCtaBlock, RichTextBlock, ImageBlock, GalleryBlock, CTABlock, YouTubeBlock, DiscordInviteBlock]
    },
    {
      name: "seo",
      type: "group",
      label: localizedLabel("SEO", "SEO"),
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          localized: true,
          label: localizedLabel("SEO-Titel", "SEO Title")
        },
        {
          name: "description",
          type: "textarea",
          required: true,
          localized: true,
          label: localizedLabel("SEO-Beschreibung", "SEO Description")
        },
        {
          name: "keywords",
          type: "text",
          localized: true,
          label: localizedLabel("SEO-Keywords", "SEO Keywords")
        },
        {
          name: "ogImage",
          type: "upload",
          relationTo: "media",
          label: localizedLabel("OG-Bild", "OG Image")
        }
      ]
    }
  ]
};
