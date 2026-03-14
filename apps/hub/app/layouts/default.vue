<script setup lang="ts">
import InternalNavSections from "../components/layout/InternalNavSections.vue";
import MobileNavDrawer from "../components/layout/MobileNavDrawer.vue";
import MobileNavPill from "../components/layout/MobileNavPill.vue";

interface InternalNavItem {
  id: string;
  label: string;
  labelKey?: string;
  to: string;
  iconPath?: string;
  active?: boolean;
}

interface InternalNavGroup {
  id: string;
  title?: string;
  titleKey?: string;
  items: InternalNavItem[];
}

interface InternalNavSection {
  id: string;
  label: string;
  to: string;
  iconPath: string;
  kind: "core" | "app";
  isActive: boolean;
  isDirect: boolean;
  groups: InternalNavGroup[];
}

const route = useRoute();
const { user, logout } = useAuth();
const { t } = useI18n();
const localePath = useLocalePath();
const { data } = await useSidebarNavigation();
const { data: branding } = await useFetch<{ logoDataUrl: string | null; communityName: string | null; sidebarLogoSizePx: number }>("/api/internal/branding", {
  key: "internal-branding",
  default: () => ({ logoDataUrl: null, communityName: null, sidebarLogoSizePx: 60 })
});

const currentUser = computed(() => {
  return (user.value as { profileName?: string; permissionRoles?: string[]; roles?: string[] } | null) || null;
});

const permissionRoles = computed(() => currentUser.value?.permissionRoles ?? currentUser.value?.roles ?? []);
const navDrawerId = "internal-mobile-nav-drawer";
const isNavOpen = ref(false);
const isDesktopNav = ref(false);
const mobileExpandedIds = ref<string[]>([]);

const iconNames = {
  dashboard: "proicons:home",
  members: "proicons:person",
  profile: "proicons:person",
  moderation: "proicons:shield",
  admin: "proicons:lock",
  marketplace: "proicons:cart",
  cms: "proicons:document"
} as const;

const fallbackRail = computed(() => {
  const roles = permissionRoles.value;
  const hasAnyRole = (...required: string[]) => required.some((role) => roles.includes(role));
  const items: Array<{ id: string; to: string; label: string; labelKey?: string; iconPath: string; visible: boolean }> = [
    { id: "dashboard", to: localePath("/dashboard"), label: t("nav.dashboard"), labelKey: "nav.dashboard", iconPath: iconNames.dashboard, visible: true },
    { id: "members", to: localePath("/members"), label: t("nav.members"), labelKey: "nav.members", iconPath: iconNames.members, visible: true },
    { id: "profile", to: localePath("/profile"), label: t("nav.profile"), labelKey: "nav.profile", iconPath: iconNames.profile, visible: true },
    { id: "moderation", to: localePath("/mod"), label: t("nav.moderation"), labelKey: "nav.moderation", iconPath: iconNames.moderation, visible: hasAnyRole("moderator", "admin", "superadmin") },
    { id: "admin", to: localePath("/admin"), label: t("nav.admin"), labelKey: "nav.admin", iconPath: iconNames.admin, visible: hasAnyRole("admin", "superadmin") },
    { id: "marketplace", to: localePath("/marketplace"), label: t("nav.marketplace"), labelKey: "nav.marketplace", iconPath: iconNames.marketplace, visible: true },
    { id: "cms", to: localePath("/cms"), label: t("nav.cms"), labelKey: "nav.cms", iconPath: iconNames.cms, visible: hasAnyRole("moderator", "admin", "superadmin") }
  ];

  return items.filter((item) => item.visible).map((item, index) => ({
    ...item,
    order: (index + 1) * 10
  }));
});

const resolveNavLabel = (label: string, key?: string) => key ? t(key) : label;

const isRouteMatch = (target: string, path: string) => path === target || path.startsWith(`${target}/`);

const sections = computed<InternalNavSection[]>(() => {
  const rail = (data.value?.rail && data.value.rail.length > 0) ? data.value.rail : fallbackRail.value;
  const panelGroups = data.value?.panelGroups || [];

  return rail.map((entry) => {
    const entryToLocalized = entry.to.startsWith("/") ? localePath(entry.to) : entry.to;
    const entryLabel = resolveNavLabel(entry.label, entry.labelKey);
    const groupsForRail = panelGroups
      .filter((group) => group.railItemId === entry.id)
      .sort((a, b) => a.order - b.order)
      .map((group) => ({
        id: group.id,
        title: group.title ? resolveNavLabel(group.title, group.titleKey) : undefined,
        titleKey: group.titleKey,
        items: group.items.map((item) => {
          const itemToLocalized = item.to.startsWith("/") ? localePath(item.to) : item.to;
          return {
            id: item.id,
            label: resolveNavLabel(item.label, item.labelKey),
            labelKey: item.labelKey,
            to: itemToLocalized,
            iconPath: item.iconPath,
            active: isRouteMatch(itemToLocalized, route.path)
          };
        })
      }))
      .filter((group) => group.items.length > 0);

    const fallbackGroup: InternalNavGroup = {
      id: `${entry.id}-default`,
      items: [
        {
          id: `${entry.id}-default-item`,
          label: entryLabel,
          to: entryToLocalized,
          iconPath: entry.iconPath,
          active: isRouteMatch(entryToLocalized, route.path)
        }
      ]
    };

    const normalizedGroups = groupsForRail.length > 0 ? groupsForRail : [fallbackGroup];
    const items = normalizedGroups.flatMap((group) => group.items);
    const uniqueTargets = Array.from(new Set(items.map((item) => item.to)));
    const isDirect = uniqueTargets.length <= 1;
    const sectionTo = isDirect ? uniqueTargets[0] || entryToLocalized : entryToLocalized;
    const isActive = isRouteMatch(sectionTo, route.path) || items.some((item) => item.active);

    return {
      id: entry.id,
      label: entryLabel,
      to: sectionTo,
      iconPath: entry.iconPath,
      kind: entry.id.startsWith("app:") ? "app" : "core",
      isActive,
      isDirect,
      groups: normalizedGroups
    };
  });
});

const showKindHeaders = computed(() => {
  const hasCore = sections.value.some((section) => section.kind === "core");
  const hasApps = sections.value.some((section) => section.kind === "app");
  return hasCore && hasApps;
});

const activeSectionLabel = computed(() => sections.value.find((section) => section.isActive)?.label || t("internalNav.sectionFallback"));
const internalLogoDataUrl = computed(() => branding.value?.logoDataUrl || null);
const sidebarLogoSizePx = computed(() => {
  const size = branding.value?.sidebarLogoSizePx ?? 60;
  return [40, 48, 60, 72].includes(size) ? size : 60;
});
const mobileLogoSizePx = computed(() => Math.min(sidebarLogoSizePx.value, 48));
const cmsBasePath = computed(() => localePath("/cms"));
const marketplaceBasePath = computed(() => localePath("/marketplace"));
const isTinySidebar = computed(() => {
  return isRouteMatch(cmsBasePath.value, route.path) || isRouteMatch(marketplaceBasePath.value, route.path);
});
const isEmbedFullContentRoute = computed(() => {
  return isRouteMatch(cmsBasePath.value, route.path) || isRouteMatch(marketplaceBasePath.value, route.path);
});

const desktopExpandedIds = computed(() => {
  const activeSection = sections.value.find((section) => section.isActive && !section.isDirect);
  return activeSection ? [activeSection.id] : [];
});

const setActiveMobileExpansion = () => {
  const activeSection = sections.value.find((section) => section.isActive && !section.isDirect);
  mobileExpandedIds.value = activeSection ? [activeSection.id] : [];
};

const toggleMobileSection = (sectionId: string) => {
  const section = sections.value.find((entry) => entry.id === sectionId && !entry.isDirect);
  if (!section) {
    return;
  }

  if (mobileExpandedIds.value.includes(sectionId)) {
    mobileExpandedIds.value = mobileExpandedIds.value.filter((entry) => entry !== sectionId);
    return;
  }

  mobileExpandedIds.value = [...mobileExpandedIds.value, sectionId];
};

const closeNav = () => {
  isNavOpen.value = false;
};

const toggleNav = () => {
  if (isDesktopNav.value) {
    return;
  }

  isNavOpen.value = !isNavOpen.value;
};

let desktopMediaQuery: MediaQueryList | null = null;

const handleDesktopChange = (event: MediaQueryListEvent) => {
  isDesktopNav.value = event.matches;
};

onMounted(() => {
  if (!import.meta.client) {
    return;
  }

  desktopMediaQuery = window.matchMedia("(min-width: 1024px)");
  isDesktopNav.value = desktopMediaQuery.matches;

  if (typeof desktopMediaQuery.addEventListener === "function") {
    desktopMediaQuery.addEventListener("change", handleDesktopChange);
    return;
  }

  desktopMediaQuery.addListener(handleDesktopChange);
});

onBeforeUnmount(() => {
  if (!desktopMediaQuery) {
    return;
  }

  if (typeof desktopMediaQuery.removeEventListener === "function") {
    desktopMediaQuery.removeEventListener("change", handleDesktopChange);
    return;
  }

  desktopMediaQuery.removeListener(handleDesktopChange);
});

watch(sections, () => {
  if (!isNavOpen.value) {
    setActiveMobileExpansion();
  }
}, { immediate: true });

watch(() => isNavOpen.value, (open) => {
  if (open) {
    setActiveMobileExpansion();
  }
});

watch(isDesktopNav, (desktop) => {
  if (desktop) {
    closeNav();
  }
}, { immediate: true });

watch(() => route.path, () => {
  closeNav();
});
</script>

<template>
  <div
    class="min-h-screen bg-base-100"
    :class="[
      isTinySidebar ? 'lg:pl-14' : 'lg:pl-80',
      isEmbedFullContentRoute ? 'h-screen overflow-hidden' : ''
    ]"
  >
    <aside
      class="fixed z-30 hidden border border-line/70 bg-base-100/95 shadow-neu-raised lg:flex lg:flex-col"
      :class="isTinySidebar
        ? 'inset-y-0 left-0 w-14 rounded-none border-y-0 border-l-0 shadow-none'
        : 'inset-y-3 left-3 w-[19.25rem] rounded-3xl'"
    >
      <template v-if="isTinySidebar">
        <nav class="min-h-0 flex-1 overflow-y-auto px-2 py-4" :aria-label="$t('internalNav.ariaLabel')">
          <div class="flex flex-col items-center gap-2">
            <NuxtLink
              v-for="section in sections"
              :key="section.id"
              :to="section.to"
              class="btn btn-sm btn-circle"
              :class="section.isActive ? 'btn-primary' : 'btn-secondary'"
              :title="section.label"
              :aria-label="section.label"
            >
              <Icon v-if="section.iconPath?.includes(':')" :name="section.iconPath" class="h-4 w-4" aria-hidden="true" />
              <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path :d="section.iconPath" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLink>
          </div>
        </nav>

        <div class="mt-auto flex justify-center border-t border-line px-2 py-4">
          <button
            class="btn btn-sm btn-circle btn-secondary"
            type="button"
            :aria-label="$t('nav.logout')"
            :title="$t('nav.logout')"
            @click="logout"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 7V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M15 12H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="m7 8-4 4 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </template>

      <template v-else>
        <div class="flex items-center gap-3 border-b border-line px-4 py-2">
          <NuxtLink
            :to="localePath('/dashboard')"
            class="btn btn-primary btn-sm relative flex shrink-0 items-center justify-center overflow-hidden rounded-full !p-0 text-sm font-bold !shadow-[0_2px_0_rgba(0,20,41,0.85)]"
            :class="internalLogoDataUrl ? '!border-0 !bg-transparent !shadow-none' : ''"
            :style="{ width: `${sidebarLogoSizePx}px`, height: `${sidebarLogoSizePx}px`, minWidth: `${sidebarLogoSizePx}px`, minHeight: `${sidebarLogoSizePx}px` }"
          >
            <img
              v-if="internalLogoDataUrl"
              :src="internalLogoDataUrl"
              alt="Newguild"
              class="absolute inset-0 h-full w-full object-cover"
            >
            <span v-else class="relative z-10">NG+</span>
          </NuxtLink>
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">{{ branding?.communityName || $t("internalNav.communityHub") }}</p>
            <p class="truncate text-xs text-base-content/60">{{ activeSectionLabel }}</p>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <InternalNavSections
            :sections="sections"
            :expanded-ids="desktopExpandedIds"
            :show-kind-headers="showKindHeaders"
          />
        </div>

        <div class="border-t border-line px-4 py-4">
          <div class="mb-3">
            <p class="text-sm font-medium">{{ currentUser?.profileName || $t("internalNav.defaultMember") }}</p>
            <p class="text-xs opacity-65">{{ permissionRoles.join(", ") || $t("internalNav.defaultPermissionRole") }}</p>
          </div>
          <button class="btn btn-secondary w-full" type="button" @click="logout">{{ $t("nav.logout") }}</button>
        </div>
      </template>
    </aside>

    <div :class="isEmbedFullContentRoute ? 'flex h-full min-h-0 flex-col' : 'flex min-h-screen flex-col'">
      <main
        :class="isEmbedFullContentRoute
          ? 'flex-1 h-full min-h-0 overflow-hidden p-0'
          : 'flex-1 pt-3 px-4 pb-28 sm:pb-32 lg:pt-3 lg:px-6 lg:pb-6'"
      >
        <div
          v-if="!isEmbedFullContentRoute"
          class="mx-auto max-w-[1700px] rounded-2xl border border-line/60 bg-base-100 p-4 shadow-neu-raised lg:p-6"
        >
          <slot />
        </div>
        <slot v-else />
      </main>
    </div>

    <MobileNavDrawer
      :open="isNavOpen"
      :panel-id="navDrawerId"
      :sections="sections"
      :expanded-ids="mobileExpandedIds"
      :show-kind-headers="showKindHeaders"
      :current-user="currentUser"
      :permission-roles="permissionRoles"
      :community-name="branding?.communityName || $t('internalNav.communityHub')"
      :active-section-label="activeSectionLabel"
      :logo-data-url="internalLogoDataUrl"
      :logo-size-px="mobileLogoSizePx"
      @toggle-section="toggleMobileSection"
      @logout="logout"
      @close="closeNav"
    />

    <MobileNavPill
      :open="isNavOpen"
      :controls-id="navDrawerId"
      @toggle="toggleNav"
    />
  </div>
</template>
