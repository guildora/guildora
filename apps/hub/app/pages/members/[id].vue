<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const localePath = useLocalePath();
const { data, error } = await useFetch("/api/profile", {
  query: {
    id: route.params.id
  }
});
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <h1 class="text-2xl font-bold md:text-3xl">{{ $t("profile.title") }}</h1>
      <NuxtLink class="btn btn-secondary btn-sm" :to="localePath('/members')">{{ $t("members.backToOverview") }}</NuxtLink>
    </div>
    <div v-if="error" class="alert alert-error">{{ $t("common.error") }}</div>
    <ProfileCard v-else-if="data" :profile="data" />
    <div v-else class="alert alert-info">{{ $t("common.notFound") }}</div>
  </section>
</template>
