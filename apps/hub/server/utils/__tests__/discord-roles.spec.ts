import { describe, expect, it } from "vitest";
import { mapEditableDiscordRoles } from "../discord-roles";

describe("discord role helpers", () => {
  it("marks only selectable roles as editable and selected by snapshot", () => {
    const result = mapEditableDiscordRoles(
      [
        { discordRoleId: "10", roleNameSnapshot: "Community A" },
        { discordRoleId: "20", roleNameSnapshot: "Community B" }
      ],
      [
        { discordRoleId: "20" },
        { discordRoleId: "30" }
      ]
    );

    expect(result).toEqual([
      { discordRoleId: "10", name: "Community A", selected: false },
      { discordRoleId: "20", name: "Community B", selected: true }
    ]);
  });
});
