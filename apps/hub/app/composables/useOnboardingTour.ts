import { ref, onMounted, onUnmounted } from "vue";

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

export function useOnboardingTour(tourId: string, steps: TourStep[], userId?: string) {
  const state = ref<TourState>({
    active: false,
    currentStep: 0,
    totalSteps: steps.length,
    step: null,
    targetRect: null
  });

  const storageKey = userId
    ? `guildora_tour_${tourId}_${userId}_seen`
    : `guildora_tour_${tourId}_seen`;

  // Generation counter — incremented on every goToStep/stop to cancel stale polls
  let pollGeneration = 0;

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

  /**
   * Poll for a CSS selector to appear in the DOM.
   * Resolves with the element once found, or null after maxWaitMs.
   */
  function waitForTarget(selector: string, generation: number, maxWaitMs = 5000, intervalMs = 100): Promise<Element | null> {
    return new Promise((resolve) => {
      const el = document.querySelector(selector);
      if (el) { resolve(el); return; }

      const start = Date.now();
      const timer = setInterval(() => {
        // Cancelled by a newer goToStep/stop call
        if (generation !== pollGeneration) { clearInterval(timer); resolve(null); return; }
        const found = document.querySelector(selector);
        if (found) { clearInterval(timer); resolve(found); return; }
        if (Date.now() - start >= maxWaitMs) { clearInterval(timer); resolve(null); }
      }, intervalMs);
    });
  }

  function goToStep(index: number) {
    pollGeneration++;
    const myGeneration = pollGeneration;

    if (index < 0 || index >= steps.length) {
      // All steps exhausted without finding targets — don't mark as seen
      stop(false);
      return;
    }

    state.value.currentStep = index;
    state.value.step = steps[index];

    waitForTarget(steps[index].target, myGeneration).then((el) => {
      if (myGeneration !== pollGeneration) return; // stale
      if (el) {
        // Scroll target into view if not visible
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (!isVisible) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          // Wait for scroll to finish, then update rect
          setTimeout(() => {
            if (myGeneration !== pollGeneration) return;
            state.value.targetRect = el.getBoundingClientRect();
            state.value.active = true;
          }, 400);
        } else {
          state.value.targetRect = rect;
          state.value.active = true;
        }
      } else {
        // Target never appeared — skip to next step
        goToStep(index + 1);
      }
    });
  }

  function start() {
    if (steps.length === 0) return;
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
    stop(true);
  }

  function stop(markAsSeen = true) {
    pollGeneration++;
    state.value.active = false;
    state.value.step = null;
    state.value.targetRect = null;
    if (markAsSeen) markSeen();
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

  function reset() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // localStorage unavailable
    }
  }

  return {
    state,
    start,
    next,
    skip,
    stop,
    startIfNotSeen,
    hasBeenSeen,
    reset
  };
}
