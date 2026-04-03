<script setup lang="ts">
defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();
</script>

<template>
  <section class="rounded-2xl bg-surface-2 px-6 py-14 shadow-md md:px-10 md:py-20">
    <h2 v-if="content.sectionTitle" class="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">
      {{ content.sectionTitle }}
    </h2>
    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(step, i) in (content.steps as Array<Record<string, unknown>>)"
        :key="i"
        class="relative flex flex-col items-start gap-4"
      >
        <div
          v-if="i < ((content.steps as Array<unknown>)?.length ?? 0) - 1"
          class="absolute left-[1.125rem] top-[1.125rem] hidden h-px w-[calc(100%+2rem-2.25rem)] translate-x-[2.25rem] bg-white/[0.08] lg:block"
        />
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent-subtle-active bg-accent-subtle text-sm font-bold text-accent-light">
          {{ i + 1 }}
        </div>
        <div>
          <p class="font-semibold">{{ step.title }}</p>
          <p class="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
