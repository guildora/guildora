import { getDb } from "../utils/db";
import { loadMembershipSettings, invalidateMembershipSettingsCache } from "../utils/membership-settings";
import { runAutoSyncCycle } from "../utils/membership-sync";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes
const STARTUP_DELAY_MS = 15_000;

let running = false;

async function checkAndRunSync() {
  if (running) return;
  running = true;

  try {
    const db = getDb();
    const settings = await loadMembershipSettings(db);

    if (!settings.autoSyncEnabled) return;

    const now = Date.now();
    const intervalMs = settings.autoSyncIntervalHours * 60 * 60 * 1000;
    const lastRun = settings.autoSyncLastRun?.getTime() ?? 0;

    if (now - lastRun < intervalMs) return;

    const runtimeConfig = useRuntimeConfig();
    const superadminDiscordId = typeof runtimeConfig.superadminDiscordId === "string" ? runtimeConfig.superadminDiscordId : null;

    const result = await runAutoSyncCycle(db, superadminDiscordId);
    // Invalidate cache so next read picks up the updated last_run
    invalidateMembershipSettingsCache();

    if (result.created > 0 || result.updated > 0) {
      console.log(
        `[membership-auto-sync] Sync complete: ${result.created} created, ${result.updated} updated, ${result.conflicts} conflicts.`
      );
    }
  } catch (err) {
    console.error("[membership-auto-sync] Sync failed:", err);
  } finally {
    running = false;
  }
}

export default defineNitroPlugin((nitroApp) => {
  const startupTimeout = setTimeout(async () => {
    await checkAndRunSync();
  }, STARTUP_DELAY_MS);

  const intervalId = setInterval(checkAndRunSync, POLL_INTERVAL_MS);

  nitroApp.hooks.hook("close", () => {
    clearTimeout(startupTimeout);
    clearInterval(intervalId);
  });
});
