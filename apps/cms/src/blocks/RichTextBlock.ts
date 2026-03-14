import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { Block } from "payload";
import { localizedLabel } from "../utils/localization";

export const RichTextBlock: Block = {
  slug: "richText",
  labels: {
    singular: localizedLabel("Rich Text", "Rich text"),
    plural: localizedLabel("Rich Text", "Rich text")
  },
  fields: [
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor({}),
      localized: true,
      label: localizedLabel("Inhalt", "Content")
    }
  ]
};
