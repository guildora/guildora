<script setup lang="ts">
defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();
</script>

<template>
  <section class="py-6">
    <h2 v-if="content.sectionTitle" class="mb-8 text-center text-2xl font-bold md:text-3xl">
      {{ content.sectionTitle }}
    </h2>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(item, i) in (content.testimonials as Array<Record<string, unknown>>)"
        :key="i"
        class="card bg-base-200 shadow-md"
      >
        <div class="card-body">
          <p class="text-sm italic opacity-80">"{{ item.quote }}"</p>
          <div class="mt-3 flex items-center gap-3">
            <div class="avatar" v-if="item.avatarUrl">
              <div class="w-10 rounded-full">
                <img :src="String(item.avatarUrl)" :alt="String(item.name || '')" />
              </div>
            </div>
            <div>
              <p class="text-sm font-bold">{{ item.name }}</p>
              <p v-if="item.role" class="text-xs opacity-60">{{ item.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
