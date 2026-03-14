import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";
import { localizedLabel } from "../utils/localization";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: localizedLabel("Benutzer", "User"),
    plural: localizedLabel("Benutzer", "Users")
  },
  auth: true,
  admin: {
    useAsTitle: "email"
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  fields: [
    {
      name: "displayName",
      type: "text",
      label: localizedLabel("Anzeigename", "Display name")
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      defaultValue: ["editor"],
      label: localizedLabel("Rollen", "Roles"),
      options: [
        {
          label: localizedLabel("Editor", "Editor"),
          value: "editor"
        },
        {
          label: localizedLabel("Moderator", "Moderator"),
          value: "moderator"
        },
        {
          label: localizedLabel("Admin", "Admin"),
          value: "admin"
        }
      ]
    }
  ]
};
