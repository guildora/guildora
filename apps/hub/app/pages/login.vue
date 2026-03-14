<script setup lang="ts">
definePageMeta({
  layout: "auth"
});

const route = useRoute();
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
        <div class="card-actions">
          <a class="btn btn-primary" :href="`/api/auth/discord?returnTo=${encodeURIComponent(returnTo)}`">
            {{ $t("nav.login") }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
