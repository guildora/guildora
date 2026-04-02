<script setup lang="ts">
import { blockComponentMap } from "./blocks";

const props = defineProps<{
  section: {
    id: string;
    blockType: string;
    sortOrder: number;
    config: Record<string, unknown>;
    content: Record<string, unknown>;
  };
}>();

const componentName = computed(() => blockComponentMap[props.section.blockType]);
</script>

<template>
  <component
    v-if="componentName"
    :is="componentName"
    :content="section.content"
    :config="section.config"
  />
  <section v-else class="card bg-base-200">
    <div class="card-body">
      <p>{{ $t("landingBlocks.unsupported", { type: section.blockType }) }}</p>
    </div>
  </section>
</template>
