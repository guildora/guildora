import { getDb } from "../utils/db";
import { loadMembershipSettings, invalidateMembershipSettingsCache } from "../utils/membership-settings";
import { runCleanupCycle } from "../utils/membership-cleanup";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes
const STARTUP_DELAY_MS = 20_000;

async function checkAndRunCleanup() {
  try {
    const db = getDb();
    const settings = await loadMembershipSettings(db);

    if (!settings.autoCleanupEnabled) return;
    if (settings.autoCleanupConditions.length === 0) return;

    const now = Date.now();
    const intervalMs = settings.autoCleanupIntervalHours * 60 * 60 * 1000;
    const lastRun = settings.autoCleanupLastRun?.getTime() ?? 0;

    if (now - lastRun < intervalMs) return;

    const result = await runCleanupCycle(db);
    // Invalidate cache so next read picks up the updated last_run
    invalidateMembershipSettingsCache();

    if (result.cleaned > 0) {
      console.log(
        `[membership-auto-cleanup] Cleanup complete: ${result.cleaned} removed, ${result.skippedProtected} protected, ${result.skippedBotUnavailable} skipped (bot unavailable).`
      );
    }
  } catch (err) {
    console.error("[membership-auto-cleanup] Cleanup failed:", err);
  }
}

export default defineNitroPlugin((nitroApp) => {
  const startupTimeout = setTimeout(async () => {
    await checkAndRunCleanup();
  }, STARTUP_DELAY_MS);

  const intervalId = setInterval(checkAndRunCleanup, POLL_INTERVAL_MS);

  nitroApp.hooks.hook("close", () => {
    clearTimeout(startupTimeout);
    clearInterval(intervalId);
  });
});
