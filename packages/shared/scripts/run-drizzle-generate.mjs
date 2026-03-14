import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(__dirname, "../../../.env");

if (fs.existsSync(rootEnv)) {
  const content = fs.readFileSync(rootEnv, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

const repoRoot = path.resolve(__dirname, "../../..");
// pnpm exec im Shared-Kontext findet drizzle-kit; .env ist bereits in process.env
const result = spawnSync(
  "pnpm",
  ["--filter", "@newguildplus/shared", "exec", "drizzle-kit", "generate"],
  { stdio: "inherit", env: process.env, cwd: repoRoot }
);

process.exit(result.status ?? 1);
