import { describe, expect, it } from "vitest";
import { bundleEntrypoint } from "../app-sideload";

describe("bundleEntrypoint", () => {
  it("bundles a TypeScript entrypoint with relative imports into CJS", async () => {
    const files: Record<string, string> = {
      "src/api/overview.get.ts": `
        import { loadTempVoiceConfig } from "../bot/configLoader"
        export default defineEventHandler(() => {
          const config = loadTempVoiceConfig({})
          return { enabled: config.enabled }
        })
      `,
      "src/bot/configLoader.ts": `
        export function loadTempVoiceConfig() {
          return { enabled: true }
        }
      `
    };

    const code = await bundleEntrypoint("src/api/overview.get.ts", async (filePath) => files[filePath] ?? null);

    expect(code).toContain("module.exports");
    expect(code).not.toContain("require(\"../bot/configLoader\")");
  });

  it("throws a readable error when an import cannot be resolved", async () => {
    const files: Record<string, string> = {
      "src/api/overview.get.ts": `
        import { missing } from "./missing"
        export default defineEventHandler(() => ({ missing }))
      `
    };

    await expect(bundleEntrypoint("src/api/overview.get.ts", async (filePath) => files[filePath] ?? null)).rejects.toThrow(
      "Failed to bundle entrypoint 'src/api/overview.get.ts'"
    );
  });
});
