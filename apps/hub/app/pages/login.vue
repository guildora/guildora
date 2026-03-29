<script setup lang="ts">
definePageMeta({
  layout: "auth"
});

const route = useRoute();
const { t, te } = useI18n();
const returnTo = computed(() => {
  const rawValue = typeof route.query.returnTo === "string" ? route.query.returnTo : "/dashboard";
  let value = rawValue;
  try {
    value = decodeURIComponent(rawValue);
  } catch {
    value = rawValue;
  }
  return value.startsWith("/") ? value : "/dashboard";
});

const loginError = computed(() => {
  const code = typeof route.query.error === "string" ? route.query.error : null;
  if (!code) return null;
  const key = `auth.errors.${code}`;
  return te(key) ? t(key) : t("auth.errors.unknown");
});

if (import.meta.dev) {
  await navigateTo(`/api/auth/discord?returnTo=${encodeURIComponent(returnTo.value)}`, { external: true });
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <div class="card bg-base-200">
      <div class="card-body">
        <h1 class="card-title">{{ $t("auth.loginTitle") }}</h1>
        <p>{{ $t("auth.loginDescription") }}</p>

        <div v-if="loginError" class="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
          {{ loginError }}
        </div>

        <div class="card-actions">
          <a class="btn btn-primary" :href="`/api/auth/discord?returnTo=${encodeURIComponent(returnTo)}`">
            {{ $t("nav.login") }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
