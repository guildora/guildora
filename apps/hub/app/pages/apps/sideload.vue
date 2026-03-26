<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
});

const lastPath = useCookie<string | null>("guildora_apps_last_path", { sameSite: "lax" });
lastPath.value = "/apps/sideload";

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

const sideloadForm = reactive({
  githubUrl: (route.query.sourceUrl as string) || "",
  activate: false
});

const sideloadError = ref<string | null>(null);
const sideloadPending = ref(false);

const sideload = async () => {
  sideloadError.value = null;
  sideloadPending.value = true;
  const input = sideloadForm.githubUrl.trim();
  const isLocalPath = input.startsWith("/") || input.startsWith("file://");
  try {
    if (isLocalPath) {
      const localPath = input.startsWith("file://") ? input.slice(7) : input;
      await $fetch("/api/admin/apps/local-sideload", {
        method: "POST",
        body: { localPath, activate: sideloadForm.activate }
      });
    } else {
      await $fetch("/api/admin/apps/sideload", {
        method: "POST",
        body: { githubUrl: input, activate: sideloadForm.activate }
      });
    }
    sideloadForm.githubUrl = "";
    sideloadPending.value = false;
    await refreshNuxtData("sidebar-navigation");
    await navigateTo(localePath("/apps/overview"));
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string }; message?: string })?.data?.message
      ?? (e as { message?: string })?.message
      ?? t("adminApps.sideloadError");
    sideloadError.value = msg;
    sideloadPending.value = false;
  }
};
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold md:text-3xl">{{ $t("adminApps.sideloadTitle") }}</h1>
      <p class="opacity-80">{{ $t("adminApps.sideloadPageDescription") }}</p>
    </div>

    <div class="card bg-base-200">
      <div class="card-body gap-4 relative">
        <div
          v-if="sideloadPending"
          class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-base-200/60"
        >
          <span class="loading loading-spinner loading-lg" />
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <UiInput
            v-model="sideloadForm.githubUrl"
            :label="$t('adminApps.githubManifestUrl')"
            placeholder="https://github.com/owner/repo"
          />
          <UiCheckbox
            v-model="sideloadForm.activate"
            :label="$t('adminApps.directActivate')"
            :description="$t('adminApps.directActivateDescription')"
            size="sm"
          />
        </div>
        <p class="text-sm opacity-75">{{ $t("adminApps.allowedSources") }}</p>
        <p class="text-sm opacity-75">{{ $t("adminApps.localPathHint") }}</p>

        <p v-if="sideloadError" class="text-sm text-error">{{ sideloadError }}</p>

        <div class="flex justify-end">
          <button class="btn btn-primary" :disabled="sideloadPending" @click="sideload">{{ $t("adminApps.sideloadInstall") }}</button>
        </div>
      </div>
    </div>
  </section>
</template>
