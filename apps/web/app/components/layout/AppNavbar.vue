<script setup lang="ts">
const config = useRuntimeConfig();
const { t } = useI18n();

const hubLoginUrl = computed(() => {
  const rawHubUrl = String(config.public.hubUrl || "").trim() || "http://localhost:3003";

  try {
    const endpoint = new URL("/login", rawHubUrl);
    endpoint.searchParams.set("returnTo", "/dashboard");
    return endpoint.toString();
  } catch {
    return "http://localhost:3003/login?returnTo=%2Fdashboard";
  }
});
</script>

<template>
  <div class="border-b border-line/60 bg-base-100 px-3 py-3 md:px-5">
    <div class="navbar mx-auto max-w-[1400px] rounded-2xl border border-accent-subtle bg-base-100/95 px-3 shadow-neu-raised-sm md:px-4">
      <div class="navbar-start">
        <NuxtLink to="/" class="btn btn-ghost text-lg font-semibold tracking-wide">{{ $t("app.name") }}</NuxtLink>
      </div>
      <div class="navbar-end gap-2">
        <a class="btn btn-sm btn-primary" :href="hubLoginUrl">{{ t("nav.login") }}</a>
      </div>
    </div>
  </div>
</template>
