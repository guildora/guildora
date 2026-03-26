import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/components/**/*.{vue,js,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/app.vue"
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "var(--color-surface-0, #0A0A0A)",
          1: "var(--color-surface-1, #0A0A0A)",
          2: "var(--color-surface-2, #111111)",
          3: "var(--color-surface-3, #1A1A1A)",
          4: "var(--color-surface-4, #222222)",
          5: "var(--color-surface-5, #2A2A2A)"
        },
        accent: {
          light: "var(--color-accent-light, #8B5CF6)",
          DEFAULT: "var(--color-accent, #7C3AED)",
          dark: "var(--color-accent-dark, #6D28D9)",
          muted: "var(--color-accent-muted, rgba(124, 58, 237, 0.2))",
          subtle: "var(--color-accent-subtle, rgba(124, 58, 237, 0.1))"
        },
        "base-100": "var(--color-surface-1, #0A0A0A)",
        "base-200": "var(--color-surface-2, #111111)",
        "base-300": "var(--color-surface-3, #1A1A1A)",
        "base-content": "var(--color-text-primary, #FAFAFA)",
        info: "var(--color-info, #3B82F6)",
        success: "var(--color-success, #22C55E)",
        warning: "var(--color-warning, #F59E0B)",
        error: "var(--color-error, #EF4444)"
      },
      borderColor: {
        "accent-subtle": "var(--color-accent-border, #1F1F1F)",
        "accent-subtle-active": "var(--color-accent-border-active, rgba(124, 58, 237, 0.5))",
        line: "var(--color-line, #1F1F1F)"
      },
      backgroundColor: {
        line: "var(--color-line, #1F1F1F)"
      },
      boxShadow: {
        sm: "var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04))",
        md: "var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.06))",
        lg: "var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.08))",
        card: "var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.06))",
        elevated: "var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.08))"
      }
    }
  },
  plugins: []
} satisfies Config;
