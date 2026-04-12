import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const avatarMimeToExtension: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif"
};

function getAvatarDirectoryPath() {
  // MEDIA_STORAGE_PATH allows explicit override (e.g. a mounted volume)
  if (process.env.MEDIA_STORAGE_PATH) {
    return path.resolve(process.env.MEDIA_STORAGE_PATH, "uploads/avatars");
  }
  // Production builds: Nitro serves static files from .output/public/
  // Development: Nuxt serves from public/
  const publicDir = process.env.NODE_ENV === "production"
    ? path.resolve(process.cwd(), ".output/public")
    : path.resolve(process.cwd(), "public");
  return path.join(publicDir, "uploads/avatars");
}

function normalizeContentType(value: string | null) {
  return value?.split(";")[0]?.trim().toLowerCase() || "";
}

async function removeOlderAvatars(avatarDirectory: string, discordId: string, currentFileName: string) {
  const entries = await readdir(avatarDirectory, { withFileTypes: true });
  const prefix = `${discordId}-`;

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.startsWith(prefix) && entry.name !== currentFileName)
      .map((entry) => rm(path.join(avatarDirectory, entry.name), { force: true }))
  );
}

export async function persistDiscordAvatarLocally(discordId: string, avatarHash: string): Promise<string | null> {
  if (!discordId || !avatarHash) {
    return null;
  }

  const sourceUrl = `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=256`;
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    return null;
  }

  const mimeType = normalizeContentType(response.headers.get("content-type"));
  const extension = avatarMimeToExtension[mimeType] || "png";
  const payload = Buffer.from(await response.arrayBuffer());
  if (payload.byteLength === 0) {
    return null;
  }

  const avatarDirectory = getAvatarDirectoryPath();
  await mkdir(avatarDirectory, { recursive: true });

  const fileName = `${discordId}-${avatarHash}.${extension}`;
  const absolutePath = path.join(avatarDirectory, fileName);

  await writeFile(absolutePath, payload);
  await removeOlderAvatars(avatarDirectory, discordId, fileName);

  return `/uploads/avatars/${fileName}`;
}
