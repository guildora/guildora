<script setup lang="ts">
import { resolveBlockComponent } from "./blocks";

const props = defineProps<{
  section: {
    id: string;
    blockType: string;
    sortOrder: number;
    config: Record<string, unknown>;
    content: Record<string, unknown>;
  };
}>();

const componentName = computed(() => resolveBlockComponent(props.section.blockType));
const resolved = computed(() => resolveComponent(componentName.value));
const isResolved = computed(() => typeof resolved.value !== "string");
</script>

<template>
  <component
    v-if="isResolved"
    :is="resolved"
    :content="section.content"
    :config="section.config"
  />
  <section v-else class="rounded-xl bg-white/5 border border-white/10 p-6 text-center text-sm opacity-60">
    <p>{{ $t("landingBlocks.unsupported", { type: section.blockType }) }}</p>
  </section>
</template>
