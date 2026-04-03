<script setup lang="ts">
const props = defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();

const variant = computed(() => String(props.config.layoutVariant || "default"));

function iconName(icon: unknown): string {
  const name = String(icon || "");
  if (!name) return "";
  if (name.includes(":")) return name;
  return `lucide:${name}`;
}
</script>

<template>
  <section class="py-16 md:py-24">
    <h2 v-if="content.sectionTitle" class="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">
      {{ content.sectionTitle }}
    </h2>
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
      <div
        v-for="(feature, i) in (content.features as Array<Record<string, unknown>>)"
        :key="i"
        :class="[
          'rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5',
          variant === 'gaming' ? 'bg-gradient-to-br from-purple-500/10 to-surface-2 shadow-md' :
          variant === 'esports' ? 'bg-surface-2 shadow-md' :
          'bg-surface-2 shadow-md'
        ]"
      >
        <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle">
          <Icon
            v-if="feature.icon"
            :name="iconName(feature.icon)"
            class="h-5 w-5 text-accent-light"
          />
          <div v-else class="h-2 w-2 rounded-full bg-accent" />
        </div>
        <h3 class="mb-1.5 text-base font-semibold">{{ feature.title }}</h3>
        <p class="text-sm leading-relaxed text-[var(--color-text-secondary)]">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>
