import { and, desc, eq } from "drizzle-orm";
import {
  appMarketplaceSubmissions,
  installedApps,
  safeParseAppManifest,
  type NewGuildPlusAppManifest
} from "@newguildplus/shared";
import { getDb } from "./db";

type AppRegistryState = {
  loadedAt: string;
  activeApps: InstalledAppSnapshot[];
};

type GlobalWithRegistry = typeof globalThis & {
  __NEWGUILDPLUS_APP_REGISTRY__?: AppRegistryState;
};

export interface InstalledAppSnapshot {
  id: string;
  appId: string;
  name: string;
  version: string;
  source: "marketplace" | "sideloaded";
  verified: boolean;
  repositoryUrl: string | null;
  status: "active" | "inactive" | "error";
  config: Record<string, unknown>;
  manifest: NewGuildPlusAppManifest;
  installedAt: Date;
  updatedAt: Date;
}

export type MutableInstalledAppStatus = "active" | "inactive";

export interface AppNavigationRailEntry {
  id: string;
  to: string;
  label: string;
  iconPath: string;
  order: number;
  appId: string;
}

export interface AppNavigationPanelItem {
  id: string;
  label: string;
  to: string;
  iconPath?: string;
  requiredRoles: string[];
}

export interface AppNavigationPanelGroup {
  id: string;
  title?: string;
  railItemId: string;
  order: number;
  appId: string;
  items: AppNavigationPanelItem[];
}

interface SubmissionCheckResult {
  key: string;
  passed: boolean;
  message: string;
}

function getRegistryContainer() {
  const container = globalThis as GlobalWithRegistry;
  if (!container.__NEWGUILDPLUS_APP_REGISTRY__) {
    container.__NEWGUILDPLUS_APP_REGISTRY__ = {
      loadedAt: new Date(0).toISOString(),
      activeApps: []
    };
  }
  return container;
}

const iconMap: Record<string, string> = {
  puzzle: "proicons:apps",
  store: "proicons:cart",
  bot: "proicons:apps"
};
const fallbackIconName = "proicons:apps";

function normalizeIconPath(icon: string) {
  if (!icon) {
    return fallbackIconName;
  }
  if (icon.includes(":")) {
    return icon;
  }
  if (icon.startsWith("M")) {
    return icon;
  }
  return iconMap[icon] ?? fallbackIconName;
}

export function hasRequiredRoles(requiredRoles: string[] | undefined, assignedRoles: string[]) {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  return requiredRoles.some((role) => assignedRoles.includes(role));
}

export async function loadActiveInstalledApps() {
  const db = getDb();
  const rows = await db.select().from(installedApps).where(eq(installedApps.status, "active"));

  const validApps: InstalledAppSnapshot[] = [];
  for (const row of rows) {
    const parsed = safeParseAppManifest(row.manifest);
    if (!parsed.success) {
      continue;
    }

    validApps.push({
      id: row.id,
      appId: row.appId,
      name: row.name,
      version: row.version,
      source: row.source,
      verified: row.verified,
      repositoryUrl: row.repositoryUrl || null,
      status: row.status,
      config: row.config || {},
      manifest: parsed.data,
      installedAt: row.installedAt,
      updatedAt: row.updatedAt
    });
  }

  return validApps;
}

export function setAppRegistrySnapshot(activeApps: InstalledAppSnapshot[]) {
  const container = getRegistryContainer();
  container.__NEWGUILDPLUS_APP_REGISTRY__ = {
    loadedAt: new Date().toISOString(),
    activeApps
  };
}

export function getAppRegistrySnapshot() {
  return getRegistryContainer().__NEWGUILDPLUS_APP_REGISTRY__;
}

export async function refreshAppRegistry() {
  const activeApps = await loadActiveInstalledApps();
  setAppRegistrySnapshot(activeApps);
  return activeApps;
}

export async function setInstalledAppStatus(appId: string, status: MutableInstalledAppStatus) {
  const db = getDb();
  await db.update(installedApps).set({ status, updatedAt: new Date() }).where(eq(installedApps.appId, appId));
  await refreshAppRegistry();
}

export function buildAppNavigation(roles: string[]) {
  const snapshot = getAppRegistrySnapshot();
  const activeApps = snapshot?.activeApps || [];
  const rail: AppNavigationRailEntry[] = [];
  const panelGroups: AppNavigationPanelGroup[] = [];

  for (const app of activeApps) {
    for (const railItem of app.manifest.navigation.rail || []) {
      if (!hasRequiredRoles(railItem.requiredRoles, roles)) {
        continue;
      }

      rail.push({
        id: `app:${app.appId}:${railItem.id}`,
        to: railItem.to || `/apps/${app.appId}`,
        label: railItem.label || app.name,
        iconPath: normalizeIconPath(railItem.icon || "puzzle"),
        order: railItem.order,
        appId: app.appId
      });
    }

    for (const group of app.manifest.navigation.panelGroups || []) {
      const visibleItems = group.items
        .filter((item) => hasRequiredRoles(item.requiredRoles, roles))
        .map((item) => ({
          id: item.id,
          label: item.label,
          to: item.to,
          iconPath: item.icon ? normalizeIconPath(item.icon) : undefined,
          requiredRoles: item.requiredRoles || []
        }));

      if (visibleItems.length === 0) {
        continue;
      }

      panelGroups.push({
        id: `app:${app.appId}:${group.id}`,
        title: group.title,
        railItemId: `app:${app.appId}:${group.railItemId}`,
        order: group.order,
        appId: app.appId,
        items: visibleItems
      });
    }
  }

  rail.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  panelGroups.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

  return {
    rail,
    panelGroups
  };
}

export async function runMarketplaceSubmissionChecks(manifest: NewGuildPlusAppManifest) {
  const db = getDb();
  const checks: SubmissionCheckResult[] = [];

  checks.push({
    key: "manifest_id",
    passed: /^[a-z0-9._-]+$/.test(manifest.id),
    message: "Manifest-ID verwendet nur erlaubte Zeichen."
  });

  checks.push({
    key: "compatibility",
    passed: Boolean(manifest.compatibility?.core?.minVersion),
    message: "Core-Kompatibilität ist gesetzt."
  });

  const installedMatch = await db.select().from(installedApps).where(eq(installedApps.appId, manifest.id)).limit(1);
  checks.push({
    key: "duplicate_installed",
    passed: installedMatch.length === 0,
    message: installedMatch.length === 0 ? "App-ID ist noch nicht installiert." : "App-ID ist bereits installiert."
  });

  const pendingMatch = await db
    .select()
    .from(appMarketplaceSubmissions)
    .where(
      and(eq(appMarketplaceSubmissions.appId, manifest.id), eq(appMarketplaceSubmissions.status, "pending"))
    )
    .limit(1);
  checks.push({
    key: "duplicate_pending_submission",
    passed: pendingMatch.length === 0,
    message:
      pendingMatch.length === 0 ? "Keine offene Einreichung mit derselben App-ID." : "Es existiert bereits eine offene Einreichung."
  });

  const latestApproved = await db
    .select()
    .from(appMarketplaceSubmissions)
    .where(
      and(eq(appMarketplaceSubmissions.appId, manifest.id), eq(appMarketplaceSubmissions.status, "approved"))
    )
    .orderBy(desc(appMarketplaceSubmissions.createdAt))
    .limit(1);
  const latestApprovedEntry = latestApproved[0];
  const latestApprovedVersion = latestApprovedEntry?.version;
  checks.push({
    key: "version_progression",
    passed: !latestApprovedEntry || latestApprovedVersion !== manifest.version,
    message:
      !latestApprovedEntry
        ? "Kein früheres Release vorhanden."
        : latestApprovedVersion !== manifest.version
          ? "Version unterscheidet sich vom letzten freigegebenen Release."
          : "Version ist identisch mit letzter freigegebener Version."
  });

  const passed = checks.every((check) => check.passed);
  return {
    passed,
    checks
  };
}
