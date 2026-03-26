<script setup lang="ts">
const props = defineProps<{
  block: Record<string, unknown>;
  cmsBaseUrl?: string;
  communityName?: string;
}>();

function mediaUrl(media: unknown): string | null {
  if (!media || typeof media !== "object") return null;
  const m = media as { url?: string };
  if (!m.url) return null;
  if (m.url.startsWith("http://") || m.url.startsWith("https://")) return m.url;
  return `${props.cmsBaseUrl ?? "http://localhost:3002"}${m.url}`;
}

function extractLexicalBlocks(input: unknown): Array<{ type: string; tag?: string; text: string }> {
  if (!input || typeof input !== "object") return [];
  const root = input as { root?: { children?: Array<Record<string, unknown>> } };
  const children = root.root?.children;
  if (!Array.isArray(children)) return [];

  return children
    .map((child) => {
      const nested = Array.isArray(child.children) ? child.children : [];
      const text = nested
        .map((node) => (typeof node.text === "string" ? node.text : ""))
        .join("")
        .trim();
      return { type: String(child.type ?? "paragraph"), tag: child.tag as string | undefined, text };
    })
    .filter((b) => b.text.length > 0);
}
</script>

<template>
  <!-- HERO -->
  <section
    v-if="block.blockType === 'hero'"
    class="relative overflow-hidden rounded-2xl bg-base-200 shadow-md"
  >
    <img
      v-if="mediaUrl(block.backgroundImage)"
      :src="mediaUrl(block.backgroundImage)!"
      alt=""
      class="absolute inset-0 h-full w-full object-cover opacity-20"
    />
    <div class="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none" />
    <div class="relative flex min-h-[56vh] flex-col items-center justify-center px-6 py-16 text-center md:py-24">
      <span
        v-if="block.eyebrowLabel"
        class="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent"
      >
        {{ block.eyebrowLabel }}
      </span>
      <h1 class="mb-4 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
        {{ block.heading }}
      </h1>
      <p class="mb-8 max-w-2xl text-base opacity-70 md:text-lg">{{ block.subheading }}</p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <a v-if="block.ctaLink" :href="String(block.ctaLink)" class="btn btn-primary btn-lg">
          {{ block.ctaText || $t("landing.cta") }}
        </a>
        <a v-if="block.ctaExploreLabel" href="#about" class="btn btn-outline btn-lg">
          {{ block.ctaExploreLabel }}
        </a>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section v-else-if="block.blockType === 'features'" class="py-6">
    <h2 v-if="block.sectionTitle" class="mb-8 text-center text-2xl font-bold md:text-3xl">
      {{ block.sectionTitle }}
    </h2>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(feature, i) in (block.features as Array<Record<string, unknown>>)"
        :key="i"
        class="card bg-base-200 shadow-md transition-transform duration-200 hover:-translate-y-0.5"
      >
        <div class="card-body gap-2">
          <div class="mb-1 text-4xl">{{ feature.icon }}</div>
          <h3 class="card-title text-base font-bold">{{ feature.title }}</h3>
          <p class="text-sm opacity-70">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section v-else-if="block.blockType === 'how-it-works'" class="rounded-2xl bg-base-200 px-6 py-10 shadow-md md:px-10">
    <h2 v-if="block.sectionTitle" class="mb-8 text-center text-2xl font-bold md:text-3xl">
      {{ block.sectionTitle }}
    </h2>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(step, i) in (block.steps as Array<Record<string, unknown>>)"
        :key="i"
        class="flex flex-col items-start gap-3"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white shadow-sm">
          {{ i + 1 }}
        </div>
        <div>
          <p class="font-bold">{{ step.title }}</p>
          <p class="mt-0.5 text-sm opacity-65">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- IMAGE -->
  <section v-else-if="block.blockType === 'image'" class="overflow-hidden rounded-2xl bg-base-200 shadow-md">
    <img
      v-if="mediaUrl(block.image)"
      :src="mediaUrl(block.image)!"
      :alt="String(block.alt || '')"
      class="w-full object-cover"
      style="max-height: 480px;"
    />
    <p v-if="block.caption" class="px-6 py-3 text-center text-sm opacity-60">
      {{ block.caption }}
    </p>
  </section>

  <!-- GALLERY -->
  <section v-else-if="block.blockType === 'gallery'" class="py-2">
    <div
      :class="[
        'grid gap-4',
        (block.images as Array<unknown>)?.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
      ]"
    >
      <div
        v-for="(item, i) in (block.images as Array<Record<string, unknown>>)"
        :key="i"
        class="overflow-hidden rounded-2xl shadow-md"
      >
        <img
          v-if="mediaUrl(item.image)"
          :src="mediaUrl(item.image)!"
          :alt="String(item.alt || '')"
          class="aspect-video w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
    </div>
  </section>

  <!-- RICH TEXT -->
  <section v-else-if="block.blockType === 'richText'" id="about" class="mx-auto max-w-3xl py-6">
    <template v-for="(b, i) in extractLexicalBlocks(block.content)" :key="i">
      <h2 v-if="b.type === 'heading' && (b.tag === 'h1' || b.tag === 'h2')" class="mb-4 text-2xl font-bold md:text-3xl">
        {{ b.text }}
      </h2>
      <h3 v-else-if="b.type === 'heading'" class="mb-3 text-xl font-semibold">{{ b.text }}</h3>
      <p v-else class="mb-4 text-sm leading-relaxed opacity-75 md:text-base">{{ b.text }}</p>
    </template>
  </section>

  <!-- DISCORD INVITE -->
  <DiscordInviteWidget
    v-else-if="block.blockType === 'discordInvite'"
    :invite-code="String(block.inviteCode)"
    :fallback-heading="String(block.heading || '')"
    :fallback-description="String(block.description || '')"
    :community-name="props.communityName"
  />

  <!-- CTA -->
  <section
    v-else-if="block.blockType === 'cta'"
    :class="[
      'card shadow-md',
      block.variant === 'accent' ? 'bg-accent text-white' : block.variant === 'secondary' ? 'bg-base-300' : 'bg-base-200'
    ]"
  >
    <div class="card-body items-center text-center">
      <h2 class="card-title justify-center text-2xl">{{ block.heading }}</h2>
      <p :class="['max-w-xl text-sm md:text-base', block.variant === 'accent' ? 'opacity-85' : 'opacity-70']">
        {{ block.description }}
      </p>
      <div class="card-actions mt-2">
        <a
          :href="String(block.buttonLink)"
          :class="['btn btn-lg', block.variant === 'accent' ? 'bg-white text-accent hover:bg-white/90 border-0' : 'btn-primary']"
        >
          {{ block.buttonText }}
        </a>
      </div>
    </div>
  </section>

  <!-- MARKETPLACE TEASER -->
  <section v-else-if="block.blockType === 'marketplace-teaser'" class="card bg-base-200 shadow-md">
    <div class="card-body text-center">
      <h2 class="card-title justify-center text-2xl">{{ block.title }}</h2>
      <p class="opacity-70">{{ block.description }}</p>
      <div class="card-actions justify-center">
        <a v-if="block.ctaLink" :href="String(block.ctaLink)" class="btn btn-primary">{{ block.ctaLabel }}</a>
      </div>
    </div>
  </section>

  <!-- SELF HOST CTA -->
  <section v-else-if="block.blockType === 'self-host-cta'" class="card bg-base-200 shadow-md">
    <div class="card-body text-center">
      <h2 class="card-title justify-center text-2xl">{{ block.title }}</h2>
      <p class="opacity-70">{{ block.description }}</p>
      <div class="card-actions justify-center">
        <a
          v-if="block.buttonLink"
          :href="String(block.buttonLink)"
          target="_blank"
          rel="noreferrer"
          class="btn btn-outline"
        >{{ block.buttonLabel }}</a>
        <span v-else-if="block.buttonLabel" class="btn btn-outline btn-disabled">{{ block.buttonLabel }}</span>
      </div>
    </div>
  </section>

  <!-- FALLBACK -->
  <section v-else class="card bg-base-200">
    <div class="card-body">
      <p>{{ $t("landingBlocks.unsupported", { type: block.blockType }) }}</p>
    </div>
  </section>
</template>
