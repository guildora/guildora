<script setup lang="ts">
const props = defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();

const runtimeConfig = useRuntimeConfig();
const hubUrl = computed(() => String(runtimeConfig.public.hubUrl || "http://localhost:3003").replace(/\/+$/, ""));

const applyUrl = computed(() => {
  if (props.config.mode === "link") {
    return String(props.content.customLink || "#");
  }
  const flowId = String(props.config.flowId || "");
  return flowId ? `${hubUrl.value}/apply/${flowId}` : "#";
});

const buttonText = computed(() => String(props.content.buttonText || props.content.heading || "Apply"));
</script>

<template>
  <section class="rounded-2xl bg-surface-2 px-6 py-14 text-center shadow-md md:px-8 md:py-20">
    <h2 class="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
      {{ content.heading }}
    </h2>
    <p v-if="content.description" class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
      {{ content.description }}
    </p>
    <div class="mt-8">
      <a
        :href="applyUrl"
        class="inline-flex items-center rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:brightness-110"
      >
        {{ buttonText }}
      </a>
    </div>
  </section>
</template>
