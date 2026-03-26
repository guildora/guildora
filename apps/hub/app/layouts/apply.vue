<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background: var(--color-surface-1)">
    <header class="flex items-center justify-center py-6">
      <NuxtLink to="/" class="flex items-center gap-3">
        <span class="text-lg font-semibold" style="color: var(--color-base-content)">
          Guildora
        </span>
      </NuxtLink>
    </header>
    <main class="flex-1 flex items-start justify-center px-4 pb-12">
      <div class="w-full max-w-2xl">
        <slot />
      </div>
    </main>
  </div>
</template>
