import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "apps/hub/vitest.config.ts",
  "packages/shared/vitest.config.ts",
]);
