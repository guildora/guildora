<script setup lang="ts">
function extractLexicalText(input: unknown): string {
  if (!input || typeof input !== "object") {
    return "";
  }

  const root = input as { root?: { children?: Array<Record<string, unknown>> } };
  const children = root.root?.children;
  if (!Array.isArray(children)) {
    return "";
  }

  const lines: string[] = [];
  for (const child of children) {
    const nested = Array.isArray(child.children) ? child.children : [];
    const text = nested
      .map((node) => (typeof node.text === "string" ? node.text : ""))
      .join("")
      .trim();
    if (text.length > 0) {
      lines.push(text);
    }
  }

  return lines.join("\n\n");
}

defineProps<{
  block: Record<string, unknown>;
}>();
</script>

<template>
  <section v-if="block.blockType === 'hero'" class="hero rounded-2xl bg-base-200 p-4 shadow-neu-raised md:p-8">
    <div class="hero-content text-center">
      <div class="max-w-2xl">
        <h1 class="text-2xl font-bold md:text-4xl">{{ block.heading }}</h1>
        <p class="py-3 text-sm md:py-4 md:text-base">{{ block.subheading }}</p>
        <a v-if="block.ctaLink" :href="String(block.ctaLink)" class="btn btn-primary">
          {{ block.ctaText || $t("landing.cta") }}
        </a>
      </div>
    </div>
  </section>

  <section v-else-if="block.blockType === 'richText'" class="prose max-w-none">
    <p class="whitespace-pre-wrap">{{ extractLexicalText(block.content) || "-" }}</p>
  </section>

  <section v-else-if="block.blockType === 'cta'" class="card bg-base-200">
    <div class="card-body">
      <h3 class="card-title">{{ block.heading }}</h3>
      <p>{{ block.description }}</p>
      <div class="card-actions">
        <a :href="String(block.buttonLink)" class="btn btn-primary">{{ block.buttonText }}</a>
      </div>
    </div>
  </section>

  <section v-else-if="block.blockType === 'discordInvite'" class="alert alert-info neu-inset">
    <div>
      <h3 class="font-semibold">{{ block.heading }}</h3>
      <p>{{ block.description }}</p>
      <a class="link link-primary" :href="`https://discord.gg/${block.inviteCode}`" target="_blank" rel="noreferrer">
        https://discord.gg/{{ block.inviteCode }}
      </a>
    </div>
  </section>

  <section v-else class="card bg-base-200">
    <div class="card-body">
      <p>{{ $t("landingBlocks.unsupported", { type: block.blockType }) }}</p>
    </div>
  </section>
</template>
