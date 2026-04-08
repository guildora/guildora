<script setup lang="ts">
const props = defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();

const heading = computed(() => String(props.content.heading || ""));
const description = computed(() => String(props.content.description || ""));
const inviteCode = computed(() => String(props.content.inviteCode || ""));
</script>

<template>
  <section v-if="heading || inviteCode" class="py-16 md:py-24">
    <div class="landing-card mx-auto max-w-lg rounded-2xl p-8 text-center shadow-md">
      <div class="mb-4 flex justify-center">
        <Icon name="simple-icons:discord" class="h-10 w-10 opacity-60" />
      </div>
      <h2 v-if="heading" class="landing-section-title text-2xl font-bold">{{ heading }}</h2>
      <p v-if="description" class="landing-text-muted mt-2 text-sm leading-relaxed">{{ description }}</p>
      <div class="mt-6">
        <span class="landing-btn-primary rounded-lg px-6 py-3 text-sm font-semibold">
          Discord beitreten
        </span>
      </div>
    </div>
  </section>
</template>
