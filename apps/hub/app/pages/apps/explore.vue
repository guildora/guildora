<script setup lang="ts">
definePageMeta({
  middleware: ["moderator"],
});

const lastPath = useCookie<string | null>("guildora_apps_last_path", { sameSite: "lax" });
lastPath.value = "/apps/explore";

const { t } = useI18n();
const localePath = useLocalePath();
const config = useRuntimeConfig();

type MarketplaceApp = {
  id: string;
  appId: string;
  name: string;
  version: string;
  sourceUrl: string | null;
  manifest: {
    description?: string;
    author?: string;
    homepageUrl?: string;
    repositoryUrl?: string;
    license?: string;
  };
  reviewedAt: string | null;
  createdAt: string;
};

type MarketplaceAppsResponse = {
  items: MarketplaceApp[];
};

const apiUrl = computed(() => {
  const base = config.public.marketplaceEmbedUrl;
  if (!base) {
    return null;
  }
  try {
    const url = new URL(base as string);
    return `${url.origin}/api/hub/apps`;
  } catch {
    return null;
  }
});

const { data, pending, error } = await useFetch<MarketplaceAppsResponse>(
  () => apiUrl.value || "",
  {
    key: "explore-marketplace-apps",
    immediate: !!apiUrl.value
  }
);

const apps = computed(() => data.value?.items ?? []);
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold md:text-3xl">{{ $t("adminApps.exploreTitle") }}</h1>
      <p class="opacity-80">{{ $t("adminApps.exploreDescription") }}</p>
    </div>

    <div v-if="!apiUrl" class="alert alert-warning">{{ $t("adminApps.exploreNotConfigured") }}</div>

    <template v-else>
      <div v-if="pending" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <div v-else-if="error" class="alert alert-error">{{ $t("adminApps.exploreError") }}</div>

      <div v-else-if="!apps.length" class="alert alert-info">{{ $t("adminApps.exploreEmpty") }}</div>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="app in apps"
          :key="app.id"
          class="card bg-base-200 shadow-sm"
        >
          <div class="card-body gap-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="card-title text-base">{{ app.name }}</h3>
                <p class="text-xs opacity-60">v{{ app.version }}</p>
              </div>
              <span v-if="app.manifest.license" class="badge badge-outline badge-sm">{{ app.manifest.license }}</span>
            </div>

            <p v-if="app.manifest.description" class="text-sm opacity-80 line-clamp-3">{{ app.manifest.description }}</p>

            <p v-if="app.manifest.author" class="text-xs opacity-60">{{ app.manifest.author }}</p>

            <div class="card-actions mt-auto flex items-center gap-2">
              <NuxtLink
                v-if="app.sourceUrl"
                :to="localePath(`/apps/sideload?sourceUrl=${encodeURIComponent(app.sourceUrl)}`)"
                class="btn btn-primary btn-sm"
              >
                {{ $t("adminApps.exploreInstall") }}
              </NuxtLink>
              <a
                v-if="app.manifest.repositoryUrl"
                :href="app.manifest.repositoryUrl"
                target="_blank"
                rel="noreferrer"
                class="btn btn-ghost btn-sm"
              >
                {{ $t("adminApps.repository") }}
              </a>
              <a
                v-if="app.manifest.homepageUrl"
                :href="app.manifest.homepageUrl"
                target="_blank"
                rel="noreferrer"
                class="btn btn-ghost btn-sm"
              >
                Homepage
              </a>
            </div>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>
