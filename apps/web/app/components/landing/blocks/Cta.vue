<script setup lang="ts">
const props = defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();

const variant = computed(() => String(props.config.variant || props.content.variant || "default"));
</script>

<template>
  <section
    :class="[
      'card shadow-md',
      variant === 'accent' ? 'bg-accent text-white' : variant === 'secondary' ? 'bg-base-300' : 'bg-base-200'
    ]"
  >
    <div class="card-body items-center text-center">
      <h2 class="card-title justify-center text-2xl">{{ content.heading }}</h2>
      <p :class="['max-w-xl text-sm md:text-base', variant === 'accent' ? 'opacity-85' : 'opacity-70']">
        {{ content.description }}
      </p>
      <div class="card-actions mt-2">
        <a
          :href="String(content.buttonLink)"
          :class="['btn btn-lg', variant === 'accent' ? 'bg-white text-accent hover:bg-white/90 border-0' : 'btn-primary']"
        >
          {{ content.buttonText }}
        </a>
      </div>
    </div>
  </section>
</template>
