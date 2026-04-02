<script setup lang="ts">
defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();
</script>

<template>
  <section class="mx-auto max-w-3xl py-6">
    <h2 v-if="content.sectionTitle" class="mb-8 text-center text-2xl font-bold md:text-3xl">
      {{ content.sectionTitle }}
    </h2>
    <div class="space-y-2">
      <div
        v-for="(item, i) in (content.items as Array<Record<string, unknown>>)"
        :key="i"
        class="collapse collapse-arrow bg-base-200"
      >
        <input type="radio" :name="'faq-accordion'" />
        <div class="collapse-title font-semibold">{{ item.question }}</div>
        <div class="collapse-content text-sm opacity-75">
          <p>{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
