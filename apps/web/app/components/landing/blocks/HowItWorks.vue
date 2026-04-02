<script setup lang="ts">
defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();
</script>

<template>
  <section class="rounded-2xl bg-base-200 px-6 py-10 shadow-md md:px-10">
    <h2 v-if="content.sectionTitle" class="mb-8 text-center text-2xl font-bold md:text-3xl">
      {{ content.sectionTitle }}
    </h2>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(step, i) in (content.steps as Array<Record<string, unknown>>)"
        :key="i"
        class="flex flex-col items-start gap-3"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white shadow-sm">
          {{ i + 1 }}
        </div>
        <div>
          <p class="font-bold">{{ step.title }}</p>
          <p class="mt-0.5 text-sm opacity-65">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
