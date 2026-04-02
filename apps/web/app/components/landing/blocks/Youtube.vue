<script setup lang="ts">
const props = defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();

const videoId = computed(() => {
  const url = String(props.content.videoUrl || "");
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match?.[1] || url;
});
</script>

<template>
  <section class="py-4">
    <h2 v-if="content.title" class="mb-4 text-center text-2xl font-bold md:text-3xl">{{ content.title }}</h2>
    <div class="aspect-video overflow-hidden rounded-2xl shadow-md">
      <iframe
        v-if="videoId"
        :src="`https://www.youtube-nocookie.com/embed/${videoId}`"
        class="h-full w-full"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>
  </section>
</template>
