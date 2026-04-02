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
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(member, i) in (content.members as Array<Record<string, unknown>>)"
        :key="i"
        class="flex flex-col items-center text-center"
      >
        <div class="avatar mb-3">
          <div class="w-24 rounded-full ring ring-accent ring-offset-2 ring-offset-base-100">
            <img v-if="member.avatarUrl" :src="String(member.avatarUrl)" :alt="String(member.name || '')" />
            <div v-else class="flex h-full w-full items-center justify-center bg-base-200 text-2xl font-bold opacity-50">
              {{ String(member.name || '?')[0] }}
            </div>
          </div>
        </div>
        <p class="font-bold">{{ member.name }}</p>
        <p v-if="member.role" class="text-sm opacity-60">{{ member.role }}</p>
      </div>
    </div>
  </section>
</template>
