import { describe, expect, it } from "vitest";
import { canUseDevRoleSwitcher, hasModeratorAccess } from "../dev-role-switcher";
import type { AppSession } from "../auth";

describe("dev role switcher permissions", () => {
  it("allows moderators, admins, and superadmins", () => {
    expect(hasModeratorAccess(["moderator"])).toBe(true);
    expect(hasModeratorAccess(["admin"])).toBe(true);
    expect(hasModeratorAccess(["superadmin"])).toBe(true);
    expect(hasModeratorAccess(["user"])).toBe(false);
  });

  it("allows switched sessions even without moderator roles", () => {
    const switchedSession: AppSession = {
      user: {
        id: "u1",
        permissionRoles: ["user"]
      },
      originalUserId: "moderator-user-id"
    };

    expect(canUseDevRoleSwitcher(switchedSession)).toBe(true);
  });

  it("blocks non-switched non-moderator sessions", () => {
    const session: AppSession = {
      user: {
        id: "u1",
        permissionRoles: ["user"]
      }
    };

    expect(canUseDevRoleSwitcher(session)).toBe(false);
  });
});
