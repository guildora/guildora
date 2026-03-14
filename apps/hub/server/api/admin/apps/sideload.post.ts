import { eq } from "drizzle-orm";
import { z } from "zod";
import { installedApps, safeParseAppManifest } from "@newguildplus/shared";
import { refreshAppRegistry } from "../../../utils/apps";
import { requireAdminSession } from "../../../utils/auth";
import { getDb } from "../../../utils/db";
import { readBodyWithSchema } from "../../../utils/http";

const sideloadSchema = z.object({
  githubUrl: z.string().url(),
  activate: z.boolean().optional(),
  verified: z.boolean().optional()
});

const manifestRequestTimeoutMs = 5000;
const maxManifestBytes = 128 * 1024;

function normalizeGitHubUrl(input: string) {
  const parsed = new URL(input);
  const hostname = parsed.hostname.toLowerCase();
  if (parsed.search || parsed.hash) {
    throw createError({ statusCode: 400, statusMessage: "URL must not contain query parameters or fragments." });
  }

  if (hostname === "raw.githubusercontent.com") {
    if (!parsed.pathname.toLowerCase().endsWith(".json")) {
      throw createError({ statusCode: 400, statusMessage: "Manifest URL must point to a .json file." });
    }
    return parsed.toString();
  }

  if (hostname !== "github.com") {
    throw createError({ statusCode: 400, statusMessage: "Only GitHub URLs are supported." });
  }

  const match = input.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
  if (!match) {
    throw createError({ statusCode: 400, statusMessage: "GitHub URL must point to a file via /blob/." });
  }

  const [, owner, repo, branch, extractedFilePath] = match;
  const filePath = extractedFilePath || "";
  if (!filePath.toLowerCase().endsWith(".json")) {
    throw createError({ statusCode: 400, statusMessage: "Manifest URL must point to a .json file." });
  }
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

async function fetchManifestInput(url: string) {
  let response: Awaited<ReturnType<typeof $fetch.raw<string>>>;
  try {
    response = await $fetch.raw<string>(url, {
      headers: {
        Accept: "application/json, text/plain"
      },
      redirect: "error",
      responseType: "text",
      retry: 0,
      timeout: manifestRequestTimeoutMs
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Failed to fetch manifest URL." });
  }

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/json") && !contentType.includes("text/plain")) {
    throw createError({ statusCode: 415, statusMessage: "Manifest URL must return JSON content." });
  }

  if (typeof response._data !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Manifest response is invalid." });
  }
  if (Buffer.byteLength(response._data, "utf8") > maxManifestBytes) {
    throw createError({ statusCode: 413, statusMessage: "Manifest is too large." });
  }

  try {
    return JSON.parse(response._data) as unknown;
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Manifest must be valid JSON." });
  }
}

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event);
  const parsedBody = await readBodyWithSchema(event, sideloadSchema, "Invalid sideload payload.");

  const normalizedUrl = normalizeGitHubUrl(parsedBody.githubUrl);
  const manifestInput = await fetchManifestInput(normalizedUrl);

  const parsedManifest = safeParseAppManifest(manifestInput);
  if (!parsedManifest.success) {
    throw createError({ statusCode: 400, statusMessage: "Manifest validation failed." });
  }
  const manifest = parsedManifest.data;

  const db = getDb();
  const existing = await db.select().from(installedApps).where(eq(installedApps.appId, manifest.id)).limit(1);
  const status = parsedBody.activate ?? false ? "active" : "inactive";
  const repositoryUrl = parsedBody.githubUrl;
  const verified = parsedBody.verified ?? false;

  if (existing[0]) {
    await db
      .update(installedApps)
      .set({
        name: manifest.name,
        version: manifest.version,
        manifest,
        status,
        source: "sideloaded",
        repositoryUrl,
        verified,
        updatedAt: new Date()
      })
      .where(eq(installedApps.appId, manifest.id));
  } else {
    await db.insert(installedApps).values({
      appId: manifest.id,
      name: manifest.name,
      version: manifest.version,
      status,
      source: "sideloaded",
      verified,
      repositoryUrl,
      manifest,
      config: {},
      createdBy: session.user.id
    });
  }

  await refreshAppRegistry();
  return { ok: true, appId: manifest.id };
});
