<script setup lang="ts">
defineProps<{
  templateId: string;
}>();
</script>

<template>
  <!-- Default: clean, minimal, subtle accent glow -->
  <div
    v-if="templateId === 'default'"
    class="template-preview"
    style="background: linear-gradient(to bottom right, rgba(124,58,237,0.08), #111, #111)"
  >
    <!-- Hero -->
    <div class="tp-hero">
      <div class="tp-badge" style="border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.1)" />
      <div class="tp-heading" />
      <div class="tp-subheading" />
      <div class="tp-btn" style="background: var(--color-accent, #7C3AED)" />
    </div>
    <!-- Features -->
    <div class="tp-cards">
      <div class="tp-card" style="background: #1a1a2e; box-shadow: 0 2px 4px rgba(0,0,0,0.3)" />
      <div class="tp-card" style="background: #1a1a2e; box-shadow: 0 2px 4px rgba(0,0,0,0.3)" />
      <div class="tp-card" style="background: #1a1a2e; box-shadow: 0 2px 4px rgba(0,0,0,0.3)" />
    </div>
    <!-- CTA -->
    <div class="tp-cta">
      <div class="tp-cta-line" />
      <div class="tp-btn" style="background: var(--color-accent, #7C3AED)" />
    </div>
  </div>

  <!-- Gaming: purple-cyan gradients, glowing borders -->
  <div
    v-else-if="templateId === 'gaming'"
    class="template-preview"
    style="background: linear-gradient(to bottom right, rgba(147,51,234,0.3), #111827 50%, #111827)"
  >
    <!-- Hero -->
    <div class="tp-hero">
      <div class="tp-badge" style="border-color: rgba(168,85,247,0.4); background: rgba(168,85,247,0.15); box-shadow: 0 0 6px rgba(168,85,247,0.2)" />
      <div class="tp-heading" />
      <div class="tp-subheading" />
      <div class="tp-btn" style="background: linear-gradient(to right, #a855f7, #06b6d4)" />
    </div>
    <!-- Features -->
    <div class="tp-cards">
      <div class="tp-card" style="background: linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); border: 1px solid rgba(168,85,247,0.25); box-shadow: 0 0 8px rgba(168,85,247,0.08)" />
      <div class="tp-card" style="background: linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); border: 1px solid rgba(168,85,247,0.25); box-shadow: 0 0 8px rgba(168,85,247,0.08)" />
      <div class="tp-card" style="background: linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); border: 1px solid rgba(168,85,247,0.25); box-shadow: 0 0 8px rgba(168,85,247,0.08)" />
    </div>
    <!-- CTA -->
    <div class="tp-cta">
      <div class="tp-cta-line" />
      <div class="tp-btn" style="background: linear-gradient(to right, #a855f7, #06b6d4)" />
    </div>
  </div>

  <!-- eSports: sleek gray, white borders, uppercase feel -->
  <div
    v-else-if="templateId === 'esports'"
    class="template-preview"
    style="background: linear-gradient(to right, #111827, #1f2937, #111827); border-bottom: 1px solid rgba(255,255,255,0.06)"
  >
    <!-- Hero -->
    <div class="tp-hero" style="border-bottom: 1px solid rgba(255,255,255,0.08)">
      <div class="tp-badge" style="border-color: rgba(124,58,237,0.5); background: rgba(124,58,237,0.1)" />
      <div class="tp-heading tp-heading--wide" />
      <div class="tp-subheading" />
      <div class="tp-btn" style="background: var(--color-accent, #7C3AED)" />
    </div>
    <!-- Features -->
    <div class="tp-cards">
      <div class="tp-card" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1)" />
      <div class="tp-card" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1)" />
      <div class="tp-card" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1)" />
    </div>
    <!-- CTA -->
    <div class="tp-cta">
      <div class="tp-cta-line" />
      <div class="tp-btn" style="background: var(--color-accent, #7C3AED)" />
    </div>
  </div>

  <!-- Fallback for unknown templates -->
  <div v-else class="template-preview" style="background: var(--color-surface-4)">
    <div class="flex items-center justify-center h-full">
      <Icon name="proicons:layout" class="h-8 w-8 opacity-20" />
    </div>
  </div>
</template>

<style scoped>
.template-preview {
  width: 100%;
  aspect-ratio: 16 / 10;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

.tp-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 0 8px;
}

.tp-badge {
  width: 36px;
  height: 6px;
  border-radius: 3px;
  border: 1px solid;
}

.tp-heading {
  width: 60%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.7);
}

.tp-heading--wide {
  width: 70%;
  height: 9px;
}

.tp-subheading {
  width: 40%;
  height: 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.25);
}

.tp-btn {
  width: 32px;
  height: 7px;
  border-radius: 3px;
  margin-top: 2px;
}

.tp-cards {
  display: flex;
  gap: 4px;
  padding: 0 4px;
  flex: 1;
}

.tp-card {
  flex: 1;
  border-radius: 4px;
  min-height: 20px;
}

.tp-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.tp-cta-line {
  width: 45%;
  height: 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.3);
}
</style>
