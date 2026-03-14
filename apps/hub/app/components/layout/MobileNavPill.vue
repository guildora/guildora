<script setup lang="ts">
const { t } = useI18n();

const props = defineProps<{
  open: boolean;
  controlsId: string;
}>();

defineEmits<{
  (event: "toggle"): void;
}>();
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-0 z-[115] flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] lg:hidden">
    <button
      type="button"
      class="mobile-burger pointer-events-auto"
      :class="props.open ? 'mobile-burger--open' : 'mobile-burger--closed'"
      :data-open="props.open ? 'true' : 'false'"
      :aria-label="props.open ? t('internalNav.closeMenu') : t('internalNav.openMenu')"
      :aria-expanded="props.open"
      :aria-controls="props.controlsId"
      aria-haspopup="dialog"
      @click="$emit('toggle')"
    >
      <span class="burger-line burger-line--top" aria-hidden="true" />
      <span class="burger-line burger-line--middle" aria-hidden="true" />
      <span class="burger-line burger-line--bottom" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.mobile-burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  border: 1px solid var(--color-accent-border, rgba(255, 255, 255, 0.12));
  background-color: color-mix(in srgb, var(--color-surface-3, #3c3938) 96%, transparent);
  box-shadow: var(--surface-shadow-sm, 0 4px 10px rgba(0, 0, 0, 0.2));
  color: var(--color-base-content, #fff);
  outline: none;
  transform: translateX(0);
  transition: transform 0.4s ease-out, background-color 0.3s ease-out, border-color 0.3s ease-out, box-shadow 0.3s ease-out;
}

.mobile-burger--open {
  transform: translateX(min(38vw, 8.75rem));
  border-color: transparent;
  background-color: transparent;
  box-shadow: none;
}

.burger-line {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1.4rem;
  height: 0.14rem;
  border-radius: 9999px;
  background-color: currentColor;
  transform-origin: center;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.mobile-burger[data-open="false"] .burger-line--top {
  transform: translate(-50%, -0.38rem) rotate(0deg);
}

.mobile-burger[data-open="false"] .burger-line--middle {
  transform: translate(-50%, 0) scaleX(1);
  opacity: 1;
}

.mobile-burger[data-open="false"] .burger-line--bottom {
  transform: translate(-50%, 0.38rem) rotate(0deg);
}

.mobile-burger[data-open="true"] .burger-line--top {
  transform: translate(-50%, 0) rotate(45deg);
}

.mobile-burger[data-open="true"] .burger-line--middle {
  transform: translate(-50%, 0) scaleX(0);
  opacity: 0;
}

.mobile-burger[data-open="true"] .burger-line--bottom {
  transform: translate(-50%, 0) rotate(-45deg);
}

.mobile-burger:focus-visible {
  outline: 2px solid var(--color-accent-border-active, rgba(255, 255, 255, 0.2));
  outline-offset: 2px;
}
</style>
