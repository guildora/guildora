import { getDb } from "../utils/db";
import { cleanupExpiredArchives } from "../utils/application-archive";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default defineNitroPlugin((nitroApp) => {
  // Run cleanup on startup (non-blocking, delayed)
  const startupTimeout = setTimeout(async () => {
    try {
      const db = getDb();
      const result = await cleanupExpiredArchives(db);
      if (result.deletedApplications > 0 || result.deletedTokens > 0) {
        console.log(
          `[archive-cleanup] Startup cleanup: ${result.deletedApplications} applications, ${result.deletedTokens} tokens deleted.`
        );
      }
    } catch (err) {
      console.error("[archive-cleanup] Startup cleanup failed:", err);
    }
  }, 5000);

  // Schedule daily cleanup
  const intervalId = setInterval(async () => {
    try {
      const db = getDb();
      const result = await cleanupExpiredArchives(db);
      if (result.deletedApplications > 0 || result.deletedTokens > 0) {
        console.log(
          `[archive-cleanup] Daily cleanup: ${result.deletedApplications} applications, ${result.deletedTokens} tokens deleted.`
        );
      }
    } catch (err) {
      console.error("[archive-cleanup] Daily cleanup failed:", err);
    }
  }, ONE_DAY_MS);

  // Clean up on server shutdown (prevents HMR stacking and allows clean exit)
  nitroApp.hooks.hook("close", () => {
    clearTimeout(startupTimeout);
    clearInterval(intervalId);
  });
});
