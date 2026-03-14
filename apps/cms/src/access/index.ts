import type { Access } from "payload";

type Role = "admin" | "moderator" | "editor";

function hasRole(roles: unknown, expected: Role[]) {
  if (!Array.isArray(roles)) {
    return false;
  }

  return roles.some((role) => typeof role === "string" && expected.includes(role as Role));
}

export const isAuthenticated: Access = ({ req }) => Boolean(req.user);

export const isAdmin: Access = ({ req }) => {
  if (!req.user) {
    return false;
  }

  return hasRole(req.user.roles, ["admin"]);
};

export const isModeratorOrAdmin: Access = ({ req }) => {
  if (!req.user) {
    return false;
  }

  return hasRole(req.user.roles, ["moderator", "admin"]);
};
