export type VoiceSessionInput = {
  startedAt: Date | string;
  endedAt: Date | string | null;
  durationMinutes?: number | null;
};

export type VoiceActivityLabelKey =
  | "profile.voiceActivity.none"
  | "profile.voiceActivity.veryLow"
  | "profile.voiceActivity.low"
  | "profile.voiceActivity.medium"
  | "profile.voiceActivity.high"
  | "profile.voiceActivity.veryHigh";

const HOUR_MS = 1000 * 60 * 60;

function toDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }
  return value instanceof Date ? value : new Date(value);
}

function clampPositiveMinutes(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

export function getSessionMinutes(session: VoiceSessionInput): number {
  if (typeof session.durationMinutes === "number" && Number.isFinite(session.durationMinutes)) {
    return clampPositiveMinutes(session.durationMinutes);
  }

  const start = toDate(session.startedAt);
  const end = toDate(session.endedAt);
  if (!start || !end) {
    return 0;
  }
  return clampPositiveMinutes((end.getTime() - start.getTime()) / 60000);
}

export function calculateVoiceMinutesFromSessions(sessions: VoiceSessionInput[], days: number, now = new Date()): number {
  const since = new Date(now.getTime() - days * 24 * HOUR_MS);
  let total = 0;

  for (const session of sessions) {
    const startedAt = toDate(session.startedAt);
    if (!startedAt || startedAt < since) {
      continue;
    }
    total += getSessionMinutes(session);
  }

  return clampPositiveMinutes(total);
}

export function classifyVoiceActivity(hours7d: number): VoiceActivityLabelKey {
  if (hours7d === 0) {
    return "profile.voiceActivity.none";
  }
  if (hours7d < 3) {
    return "profile.voiceActivity.veryLow";
  }
  if (hours7d < 7) {
    return "profile.voiceActivity.low";
  }
  if (hours7d < 35) {
    return "profile.voiceActivity.medium";
  }
  if (hours7d < 50) {
    return "profile.voiceActivity.high";
  }
  return "profile.voiceActivity.veryHigh";
}

export function formatMinutesToHours(value: number): number {
  return Math.round((clampPositiveMinutes(value) / 60) * 100) / 100;
}
