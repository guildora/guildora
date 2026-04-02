<script setup lang="ts">
defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();
</script>

<template>
  <section class="py-2">
    <div
      :class="[
        'grid gap-4',
        (content.images as Array<unknown>)?.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
      ]"
    >
      <div
        v-for="(item, i) in (content.images as Array<Record<string, unknown>>)"
        :key="i"
        class="overflow-hidden rounded-2xl shadow-md"
      >
        <img
          v-if="item.url || item.image"
          :src="String(item.url || item.image)"
          :alt="String(item.alt || '')"
          class="aspect-video w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
    </div>
  </section>
</template>
