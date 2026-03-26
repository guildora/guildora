// @guildora/app-sdk — Types for Guildora app plugins

// ─── Bot hook payloads ───────────────────────────────────────────────────────

export interface VoiceActivityPayload {
  guildId: string;
  memberId: string;
  /** "join" | "leave" | "move" */
  action: "join" | "leave" | "move";
  channelId: string | null;
  previousChannelId: string | null;
  /** Seconds spent in the previous channel (only present on leave/move) */
  durationSeconds?: number;
  occurredAt: string;
}

export interface RoleChangePayload {
  guildId: string;
  memberId: string;
  addedRoles: string[];
  removedRoles: string[];
}

export interface MemberJoinPayload {
  guildId: string;
  memberId: string;
  username: string;
  joinedAt: string | null;
}

export interface InteractionPayload {
  guildId: string | null;
  memberId: string;
  commandName: string;
  channelId: string | null;
  occurredAt: string;
}

// ─── App KV store ────────────────────────────────────────────────────────────

export interface AppDb {
  /** Get a value by key (returns null if missing). */
  get(key: string): Promise<unknown | null>;
  /** Set a value for a key. */
  set(key: string, value: unknown): Promise<void>;
  /** Delete a key. */
  delete(key: string): Promise<void>;
  /** List all entries whose key starts with a given prefix. */
  list(prefix: string): Promise<Array<{ key: string; value: unknown }>>;
}

// ─── Bot client ──────────────────────────────────────────────────────────────

export interface BotClient {
  /** Send a message to a Discord channel by ID. */
  sendMessage(channelId: string, content: string): Promise<void>;
}

// ─── Bot context ─────────────────────────────────────────────────────────────

export interface BotContext {
  /** App config values as set by the guild admin. */
  config: Record<string, unknown>;
  /** Scoped KV store for this app. */
  db: AppDb;
  /** Discord bot client. */
  bot: BotClient;
}

// ─── Hub context (injected into event.context.guildora) ──────────────────

export interface HubAppContext {
  /** Authenticated user's ID. */
  userId: string;
  /** Authenticated user's permission roles. */
  userRoles: string[];
  /** Current guild ID (null for global routes). */
  guildId: string | null;
  /** App config values. */
  config: Record<string, unknown>;
  /** Scoped KV store for this app. */
  db: AppDb;
  /** Persist updated app config values (merges with or replaces the stored config). */
  saveConfig(config: Record<string, unknown>): Promise<void>;
}
