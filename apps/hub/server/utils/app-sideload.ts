import * as esbuild from "esbuild";
import { posix } from "node:path";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { installedApps, safeParseAppManifest } from "@guildora/shared";
import { refreshAppRegistry } from "./apps";
import { getDb } from "./db";

const manifestRequestTimeoutMs = 5000;
const maxManifestBytes = 128 * 1024;
const maxSourceBytes = 256 * 1024;
const maxLocales = ["en", "de"] as const;
const moduleLoaders: Record<string, esbuild.Loader> = {
  ".ts": "ts",
  ".tsx": "tsx",
  ".js": "js",
  ".mjs": "js",
  ".cjs": "js",
  ".json": "json"
};
const extensionResolutionOrder = [".ts", ".tsx", ".js", ".mjs", ".cjs", ".json"];

type SourceLoader = (filePath: string) => Promise<string | null>;

/** Parse owner/repo/branch from a resolved raw URL. */
export function parseRawUrl(rawUrl: string): { owner: string; repo: string; branch: string } | null {
  const m = rawUrl.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\//);
  if (!m) return null;
  return { owner: m[1]!, repo: m[2]!, branch: m[3]! };
}

/** Build a raw.githubusercontent.com URL for any file in the same repo. */
export function resolveRawFileUrl(base: { owner: string; repo: string; branch: string }, filePath: string): string {
  return `https://raw.githubusercontent.com/${base.owner}/${base.repo}/${base.branch}/${filePath}`;
}

/** Returns one or more raw URLs to try in order (for repo URLs, tries main then master). */
export function resolveManifestUrls(input: string): string[] {
  const parsed = new URL(input);
  const hostname = parsed.hostname.toLowerCase();

  if (parsed.search || parsed.hash) {
    throw createError({ statusCode: 400, statusMessage: "URL must not contain query parameters or fragments." });
  }

  if (hostname === "raw.githubusercontent.com") {
    if (!parsed.pathname.toLowerCase().endsWith(".json")) {
      throw createError({ statusCode: 400, statusMessage: "Manifest URL must point to a .json file." });
    }
    return [parsed.href];
  }

  if (hostname !== "github.com") {
    throw createError({ statusCode: 400, statusMessage: "Only GitHub URLs are supported." });
  }

  const path = parsed.pathname.replace(/\.git$/, "");

  // Explicit blob URL: /owner/repo/blob/branch/path/to/file.json
  const blobMatch = path.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
  if (blobMatch) {
    const [, owner, repo, branch, filePath] = blobMatch;
    if (!filePath!.toLowerCase().endsWith(".json")) {
      throw createError({ statusCode: 400, statusMessage: "Manifest URL must point to a .json file." });
    }
    return [`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`];
  }

  // Repo URL: /owner/repo or /owner/repo.git — auto-discover manifest.json
  const repoMatch = path.match(/^\/([^/]+)\/([^/]+)$/);
  if (repoMatch) {
    const [, owner, repo] = repoMatch;
    return [
      `https://raw.githubusercontent.com/${owner}/${repo}/main/manifest.json`,
      `https://raw.githubusercontent.com/${owner}/${repo}/master/manifest.json`
    ];
  }

  throw createError({ statusCode: 400, statusMessage: "Only GitHub repository or file URLs are supported." });
}

export async function fetchManifestInput(urls: string[]): Promise<{ input: unknown; resolvedUrl: string }> {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]!;
    let response: Awaited<ReturnType<typeof $fetch.raw<string>>>;
    try {
      response = await $fetch.raw<string>(url, {
        headers: { Accept: "application/json, text/plain" },
        redirect: "error",
        responseType: "text",
        retry: 0,
        timeout: manifestRequestTimeoutMs
      });
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      // 404 on a candidate URL — try next
      if (status === 404 && i < urls.length - 1) continue;
      if (status === 404) {
        throw createError({ statusCode: 404, statusMessage: "manifest.json not found in the repository." });
      }
      throw createError({ statusCode: 502, statusMessage: "Failed to fetch manifest." });
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
      return { input: JSON.parse(response._data) as unknown, resolvedUrl: url };
    } catch {
      throw createError({ statusCode: 400, statusMessage: "Manifest must be valid JSON." });
    }
  }

  throw createError({ statusCode: 404, statusMessage: "manifest.json not found in the repository." });
}

/** Fetch a single source file from GitHub. Returns null on 404. Throws on other errors. */
export async function fetchSourceFile(url: string): Promise<string | null> {
  let response: Awaited<ReturnType<typeof $fetch.raw<string>>>;
  try {
    response = await $fetch.raw<string>(url, {
      headers: { Accept: "text/plain, application/octet-stream" },
      redirect: "error",
      responseType: "text",
      retry: 0,
      timeout: manifestRequestTimeoutMs
    });
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status;
    if (status === 404) return null;
    throw createError({ statusCode: 502, statusMessage: `Failed to fetch source file: ${url}` });
  }

  if (typeof response._data !== "string") return null;
  if (Buffer.byteLength(response._data, "utf8") > maxSourceBytes) {
    throw createError({ statusCode: 413, statusMessage: `Source file too large (> 256 KB): ${url}` });
  }
  return response._data;
}

function normalizeRepoPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\/+/, "").replace(/^\.\//, "");
}

async function resolveRepoModulePath(sourceLoader: SourceLoader, unresolvedPath: string): Promise<string | null> {
  const normalized = normalizeRepoPath(unresolvedPath);
  const ext = posix.extname(normalized);
  const candidates = new Set<string>();

  if (ext) {
    candidates.add(normalized);
  } else {
    candidates.add(normalized);
    for (const suffix of extensionResolutionOrder) {
      candidates.add(`${normalized}${suffix}`);
      candidates.add(posix.join(normalized, `index${suffix}`));
    }
  }

  for (const candidate of candidates) {
    const source = await sourceLoader(candidate);
    if (source !== null) {
      return candidate;
    }
  }

  return null;
}

function extractBundleError(error: unknown): string {
  const esbuildError = error as { errors?: Array<{ text?: string; location?: { file?: string; line?: number; column?: number } }> };
  const first = esbuildError.errors?.[0];
  if (!first) {
    return (error as Error)?.message || "unknown error";
  }

  const location = first.location?.file
    ? `${first.location.file}${typeof first.location.line === "number" ? `:${first.location.line}` : ""}${
      typeof first.location.column === "number" ? `:${first.location.column}` : ""
    }`
    : null;

  return location ? `${location} ${first.text || "build error"}` : first.text || "build error";
}

export async function bundleEntrypoint(entryPath: string, sourceLoader: SourceLoader): Promise<string> {
  const entry = normalizeRepoPath(entryPath);
  const namespace = "guildora-sideload";

  const plugin: esbuild.Plugin = {
    name: "guildora-sideload-loader",
    setup(build) {
      build.onResolve({ filter: /.*/ }, async (args) => {
        if (args.kind === "entry-point") {
          return { path: entry, namespace };
        }

        const request = args.path;
        const importer = args.importer || entry;

        if (!request.startsWith(".") && !request.startsWith("/")) {
          return {
            errors: [
              {
                text: `Unsupported non-relative import '${request}' from '${importer}'. Sideloaded runtime does not provide package resolution.`
              }
            ]
          };
        }

        const importerDir = posix.dirname(importer);
        const unresolved = request.startsWith("/")
          ? normalizeRepoPath(request)
          : normalizeRepoPath(posix.join(importerDir, request));

        const resolved = await resolveRepoModulePath(sourceLoader, unresolved);
        if (!resolved) {
          return {
            errors: [
              {
                text: `Could not resolve '${request}' from '${importer}'.`
              }
            ]
          };
        }

        return { path: resolved, namespace };
      });

      build.onLoad({ filter: /.*/, namespace }, async (args) => {
        const source = await sourceLoader(args.path);
        if (source === null) {
          return {
            errors: [{ text: `Source file not found in repository: ${args.path}` }]
          };
        }

        const ext = posix.extname(args.path);
        const loader = moduleLoaders[ext];
        if (!loader) {
          return {
            errors: [{ text: `Unsupported source extension '${ext || "(none)"}' for '${args.path}'.` }]
          };
        }

        return {
          contents: source,
          loader,
          resolveDir: posix.dirname(args.path)
        };
      });
    }
  };

  try {
    const result = await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      format: "cjs",
      platform: "node",
      target: "node20",
      write: false,
      outfile: "bundle.cjs",
      logLevel: "silent",
      plugins: [plugin]
    });

    const output = result.outputFiles?.[0]?.text;
    if (!output) {
      throw new Error(`Bundling produced no output for '${entryPath}'.`);
    }
    return output;
  } catch (error: unknown) {
    throw new Error(`Failed to bundle entrypoint '${entryPath}': ${extractBundleError(error)}`);
  }
}

/** Normalize to a clean repo URL (strip .git, no trailing slash). */
export function toRepositoryUrl(input: string): string {
  const parsed = new URL(input);
  const path = parsed.pathname.replace(/\.git$/, "").replace(/\/$/, "");
  const blobMatch = path.match(/^(\/[^/]+\/[^/]+)\/blob\//);
  return `https://github.com${blobMatch ? blobMatch[1] : path}`;
}

/**
 * Full install/update flow for a sideloaded app from a GitHub URL.
 * Resolves, fetches, transpiles, upserts DB row, refreshes registry.
 */
export async function installAppFromUrl(
  githubUrl: string,
  options: {
    activate?: boolean;
    verified?: boolean;
    createdBy?: string | null;
    preserveAutoUpdate?: boolean;
  }
): Promise<{ appId: string }> {
  const manifestUrls = resolveManifestUrls(githubUrl);
  const { input: manifestInput, resolvedUrl } = await fetchManifestInput(manifestUrls);

  const parsedManifest = safeParseAppManifest(manifestInput);
  if (!parsedManifest.success) {
    const issues = parsedManifest.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw createError({ statusCode: 400, statusMessage: `Manifest validation failed: ${issues}` });
  }
  const manifest = parsedManifest.data;

  const codeBundle: Record<string, string> = {};
  const base = parseRawUrl(resolvedUrl);

  if (base) {
    const sourceCache = new Map<string, string | null>();
    const loadRemoteSource: SourceLoader = async (filePath) => {
      const normalizedPath = normalizeRepoPath(filePath);
      if (sourceCache.has(normalizedPath)) {
        return sourceCache.get(normalizedPath) ?? null;
      }
      const source = await fetchSourceFile(resolveRawFileUrl(base, normalizedPath));
      sourceCache.set(normalizedPath, source);
      return source;
    };

    const handlerEntryByKey = new Map<string, string>();
    for (const route of manifest.apiRoutes || []) {
      if (!route.handler) continue;
      handlerEntryByKey.set(route.handler, normalizeRepoPath(route.handler));
    }

    for (const [handlerKey, entryPath] of handlerEntryByKey.entries()) {
      try {
        codeBundle[handlerKey] = await bundleEntrypoint(entryPath, loadRemoteSource);
      } catch (error: unknown) {
        throw createError({
          statusCode: 400,
          statusMessage: (error as Error).message
        });
      }
    }

    if ((manifest.botHooks || []).length > 0) {
      try {
        codeBundle["src/bot/hooks.ts"] = await bundleEntrypoint("src/bot/hooks.ts", loadRemoteSource);
      } catch (error: unknown) {
        throw createError({
          statusCode: 400,
          statusMessage: (error as Error).message
        });
      }
    }

    for (const page of manifest.pages || []) {
      if (!page.component) continue;
      const source = await loadRemoteSource(page.component);
      if (source !== null) {
        codeBundle[page.component] = source;
      }
    }

    for (const locale of maxLocales) {
      const localePath = `src/i18n/${locale}.json`;
      const source = await loadRemoteSource(localePath);
      if (source === null) continue;
      try {
        JSON.parse(source);
      } catch {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid JSON in '${localePath}'.`
        });
      }
      codeBundle[localePath] = source;
    }
  }

  const db = getDb();
  const existing = await db.select().from(installedApps).where(eq(installedApps.appId, manifest.id)).limit(1);
  const status = options.activate ?? false ? "active" : "inactive";
  const repositoryUrl = toRepositoryUrl(githubUrl);
  const verified = options.verified ?? false;

  if (existing[0]) {
    const autoUpdate = options.preserveAutoUpdate ? existing[0].autoUpdate : false;
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
        autoUpdate,
        codeBundle,
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
      autoUpdate: false,
      repositoryUrl,
      manifest,
      config: {},
      codeBundle,
      createdBy: options.createdBy ?? null
    });
  }

  await refreshAppRegistry();
  return { appId: manifest.id };
}

/**
 * Install or reinstall a sideloaded app from a local filesystem directory.
 * The directory must contain a manifest.json and the source files referenced by it.
 */
export async function installAppFromLocalPath(
  localPath: string,
  options: {
    activate?: boolean;
    verified?: boolean;
    preserveConfig?: boolean;
  }
): Promise<{ appId: string }> {
  const manifestPath = join(localPath, "manifest.json");
  let manifestText: string;
  try {
    manifestText = await readFile(manifestPath, "utf-8");
  } catch {
    throw createError({ statusCode: 404, statusMessage: `manifest.json not found at '${localPath}'.` });
  }

  let manifestInput: unknown;
  try {
    manifestInput = JSON.parse(manifestText);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "manifest.json is not valid JSON." });
  }

  const parsedManifest = safeParseAppManifest(manifestInput);
  if (!parsedManifest.success) {
    const issues = parsedManifest.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw createError({ statusCode: 400, statusMessage: `Manifest validation failed: ${issues}` });
  }
  const manifest = parsedManifest.data;

  const loadLocalSource: SourceLoader = async (filePath) => {
    try {
      return await readFile(join(localPath, filePath), "utf-8");
    } catch {
      return null;
    }
  };

  const codeBundle: Record<string, string> = {};

  // Bundle API handlers
  const handlerEntryByKey = new Map<string, string>();
  for (const route of manifest.apiRoutes || []) {
    if (!route.handler) continue;
    handlerEntryByKey.set(route.handler, normalizeRepoPath(route.handler));
  }
  for (const [handlerKey, entryPath] of handlerEntryByKey.entries()) {
    try {
      codeBundle[handlerKey] = await bundleEntrypoint(entryPath, loadLocalSource);
    } catch (error: unknown) {
      throw createError({ statusCode: 400, statusMessage: (error as Error).message });
    }
  }

  // Bundle bot hooks
  if ((manifest.botHooks || []).length > 0) {
    try {
      codeBundle["src/bot/hooks.ts"] = await bundleEntrypoint("src/bot/hooks.ts", loadLocalSource);
    } catch (error: unknown) {
      throw createError({ statusCode: 400, statusMessage: (error as Error).message });
    }
  }

  // Load Vue SFC pages (served raw to vue3-sfc-loader — no bundling)
  for (const page of manifest.pages || []) {
    if (!page.component) continue;
    const source = await loadLocalSource(page.component);
    if (source !== null) {
      codeBundle[page.component] = source;
    }
  }

  // Load i18n locale files
  for (const locale of maxLocales) {
    const localePath = `src/i18n/${locale}.json`;
    const source = await loadLocalSource(localePath);
    if (source === null) continue;
    try {
      JSON.parse(source);
    } catch {
      throw createError({ statusCode: 400, statusMessage: `Invalid JSON in '${localePath}'.` });
    }
    codeBundle[localePath] = source;
  }

  const db = getDb();
  const existing = await db.select().from(installedApps).where(eq(installedApps.appId, manifest.id)).limit(1);
  const repositoryUrl = `file://${localPath}`;
  const verified = options.verified ?? existing[0]?.verified ?? false;

  if (existing[0]) {
    const status = options.activate !== undefined
      ? (options.activate ? "active" : "inactive")
      : existing[0].status;
    const config = options.preserveConfig !== false ? (existing[0].config ?? {}) : {};
    await db
      .update(installedApps)
      .set({
        name: manifest.name,
        version: manifest.version,
        manifest,
        status,
        repositoryUrl,
        verified,
        codeBundle,
        config,
        updatedAt: new Date()
      })
      .where(eq(installedApps.appId, manifest.id));
  } else {
    await db.insert(installedApps).values({
      appId: manifest.id,
      name: manifest.name,
      version: manifest.version,
      status: options.activate ? "active" : "inactive",
      source: "sideloaded",
      verified,
      autoUpdate: false,
      repositoryUrl,
      manifest,
      config: {},
      codeBundle,
      createdBy: null
    });
  }

  await refreshAppRegistry();
  return { appId: manifest.id };
}
