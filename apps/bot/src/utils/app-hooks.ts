import { eq } from "drizzle-orm";
import { installedApps, safeParseAppManifest, type NewGuildPlusAppBotHook } from "@newguildplus/shared";
import { getDb } from "./db";
import { logger } from "./logger";

export type BotHookEventMap = {
  onMemberJoin: {
    guildId: string;
    userId: string;
    username: string;
    joinedAt: string | null;
  };
  onRoleChange: {
    guildId: string;
    userId: string;
    addedRoleIds: string[];
    removedRoleIds: string[];
  };
  onVoiceActivity: {
    guildId: string;
    userId: string;
    oldChannelId: string | null;
    newChannelId: string | null;
    eventType: "joined" | "left" | "moved";
    occurredAt: string;
  };
  onInteraction: {
    guildId: string | null;
    userId: string;
    commandName: string;
    channelId: string | null;
    occurredAt: string;
  };
};

type BotHookEventName = keyof BotHookEventMap;
type BotHookHandler<K extends BotHookEventName> = (payload: BotHookEventMap[K]) => Promise<void> | void;

class BotAppHookRegistry {
  private handlers = new Map<BotHookEventName, Map<string, BotHookHandler<BotHookEventName>>>();

  register<K extends BotHookEventName>(appId: string, eventName: K, handler: BotHookHandler<K>) {
    const scopedHandlers = this.handlers.get(eventName) || new Map<string, BotHookHandler<BotHookEventName>>();
    scopedHandlers.set(appId, handler as BotHookHandler<BotHookEventName>);
    this.handlers.set(eventName, scopedHandlers);
  }

  unregister(appId: string, eventName?: BotHookEventName) {
    if (eventName) {
      this.handlers.get(eventName)?.delete(appId);
      return;
    }
    for (const handlers of this.handlers.values()) {
      handlers.delete(appId);
    }
  }

  clearAll() {
    this.handlers.clear();
  }

  async emit<K extends BotHookEventName>(eventName: K, payload: BotHookEventMap[K]) {
    const scopedHandlers = this.handlers.get(eventName);
    if (!scopedHandlers || scopedHandlers.size === 0) {
      return;
    }

    for (const [appId, handler] of scopedHandlers.entries()) {
      try {
        await handler(payload);
      } catch (error) {
        // Error-boundary: plugin hooks must never crash the core bot runtime.
        logger.error(`App hook failed [${appId}] on ${eventName}`, error);
      }
    }
  }
}

function registerManifestHook(appId: string, hookName: NewGuildPlusAppBotHook) {
  botAppHookRegistry.register(appId, hookName, async (payload) => {
    logger.info(
      `[app-hook] ${appId} -> ${hookName} ${JSON.stringify({
        guildId: (payload as { guildId?: string }).guildId || null,
        userId: (payload as { userId?: string }).userId || null
      })}`
    );
  });
}

export async function loadInstalledAppHooks() {
  const db = getDb();
  const rows = await db.select().from(installedApps).where(eq(installedApps.status, "active"));
  botAppHookRegistry.clearAll();

  for (const row of rows) {
    const parsed = safeParseAppManifest(row.manifest);
    if (!parsed.success) {
      logger.warn(`Skipping app hooks for ${row.appId}: invalid manifest.`);
      continue;
    }

    for (const hookName of parsed.data.botHooks || []) {
      registerManifestHook(row.appId, hookName);
    }
  }

  logger.info(`Loaded bot hooks for ${rows.length} active app(s).`);
}

export const botAppHookRegistry = new BotAppHookRegistry();
