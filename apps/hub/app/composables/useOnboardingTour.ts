import { ref, onMounted, onUnmounted, nextTick } from "vue";

export interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right";
}

export interface TourState {
  active: boolean;
  currentStep: number;
  totalSteps: number;
  step: TourStep | null;
  targetRect: DOMRect | null;
}

export function useOnboardingTour(tourId: string, steps: TourStep[]) {
  const state = ref<TourState>({
    active: false,
    currentStep: 0,
    totalSteps: steps.length,
    step: null,
    targetRect: null
  });

  const storageKey = `guildora_tour_${tourId}_seen`;

  function hasBeenSeen(): boolean {
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  }

  function markSeen() {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // localStorage unavailable
    }
  }

  function updateTargetRect() {
    if (!state.value.step) return;
    const el = document.querySelector(state.value.step.target);
    if (el) {
      state.value.targetRect = el.getBoundingClientRect();
    } else {
      state.value.targetRect = null;
    }
  }

  function goToStep(index: number) {
    if (index < 0 || index >= steps.length) {
      stop();
      return;
    }
    state.value.currentStep = index;
    state.value.step = steps[index];
    nextTick(() => updateTargetRect());
  }

  function start() {
    if (steps.length === 0) return;
    state.value.active = true;
    goToStep(0);
  }

  function next() {
    if (state.value.currentStep < steps.length - 1) {
      goToStep(state.value.currentStep + 1);
    } else {
      stop();
    }
  }

  function skip() {
    stop();
  }

  function stop() {
    state.value.active = false;
    state.value.step = null;
    state.value.targetRect = null;
    markSeen();
  }

  function startIfNotSeen(delayMs = 500) {
    if (!hasBeenSeen()) {
      setTimeout(() => start(), delayMs);
    }
  }

  // Re-calculate position on scroll/resize
  let rafId: number | null = null;

  function onScrollOrResize() {
    if (!state.value.active) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => updateTargetRect());
  }

  onMounted(() => {
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", onScrollOrResize, true);
    window.removeEventListener("resize", onScrollOrResize);
    if (rafId) cancelAnimationFrame(rafId);
  });

  return {
    state,
    start,
    next,
    skip,
    stop,
    startIfNotSeen,
    hasBeenSeen
  };
}
