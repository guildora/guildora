import type { Config } from "tailwindcss";
import daisyui from "daisyui";

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
          0: "var(--color-surface-0, #262322)",
          1: "var(--color-surface-1, #262322)",
          2: "var(--color-surface-2, #312e2d)",
          3: "var(--color-surface-3, #3c3938)",
          4: "var(--color-surface-4, #494645)",
          5: "var(--color-surface-5, #565353)"
        },
        accent: {
          light: "var(--color-accent-light, #ff5c94)",
          DEFAULT: "var(--color-accent, #ff206e)",
          dark: "var(--color-accent-dark, #c91a58)",
          muted: "var(--color-accent-muted, #4a1530)",
          subtle: "var(--color-accent-subtle, #2a0d18)"
        }
      },
      borderColor: {
        "accent-subtle": "var(--color-accent-border, rgba(255, 255, 255, 0.12))",
        "accent-subtle-active": "var(--color-accent-border-active, rgba(255, 255, 255, 0.2))",
        line: "var(--color-line, rgba(38, 35, 34, 0.6))"
      },
      backgroundColor: {
        line: "var(--color-line, rgba(38, 35, 34, 0.6))"
      },
      boxShadow: {
        "neu-raised-sm": "var(--surface-shadow-sm, 0 4px 10px rgba(0, 0, 0, 0.2))",
        "neu-raised": "var(--surface-shadow-md, 0 8px 18px rgba(0, 0, 0, 0.24))",
        "neu-raised-lg": "var(--surface-shadow-lg, 0 14px 28px rgba(0, 0, 0, 0.28))",
        "neu-inset": "var(--surface-inset-border, inset 0 0 0 1px rgba(255, 255, 255, 0.18))",
        "neu-flat": "none",
        "retro-glow": "0 0 0.75rem rgba(255, 32, 110, 0.45), 0 0 2rem rgba(255, 32, 110, 0.25)",
        "retro-glow-soft": "0 0 0.5rem rgba(255, 32, 110, 0.3)"
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    darkTheme: "retromorphism-dark",
    themes: [
      {
        "retromorphism-dark": {
          primary: "var(--color-accent, #ff206e)",
          "primary-content": "var(--color-accent-content, #ffffff)",
          secondary: "var(--color-surface-4, #494645)",
          "secondary-content": "var(--color-secondary, #ffffff)",
          accent: "var(--color-accent, #ff206e)",
          "accent-content": "var(--color-accent-content, #ffffff)",
          neutral: "var(--color-surface-3, #3c3938)",
          "base-100": "var(--color-surface-1, #141115)",
          "base-200": "var(--color-surface-2, #312e2d)",
          "base-300": "var(--color-surface-3, #3c3938)",
          "base-content": "var(--color-secondary, #ffffff)",
          info: "var(--color-info, #48beff)",
          "info-content": "var(--color-info-content, #001429)",
          success: "var(--color-success, #0cf574)",
          "success-content": "var(--color-success-content, #001429)",
          warning: "var(--color-warning, #f18f01)",
          "warning-content": "var(--color-warning-content, #ffffff)",
          error: "var(--color-error, #bf211e)",
          "error-content": "var(--color-error-content, #ffffff)"
        }
      },
      {
        "retromorphism-light": {
          primary: "var(--color-accent, #ff206e)",
          "primary-content": "var(--color-accent-content, #ffffff)",
          secondary: "var(--color-surface-4, #dedad6)",
          "secondary-content": "var(--color-text-primary, #001429)",
          accent: "var(--color-accent, #ff206e)",
          "accent-content": "var(--color-accent-content, #ffffff)",
          neutral: "var(--color-surface-3, #e8e4e0)",
          "base-100": "var(--color-surface-1, #f7f5f2)",
          "base-200": "var(--color-surface-2, #efebe7)",
          "base-300": "var(--color-surface-3, #e8e4e0)",
          "base-content": "var(--color-text-primary, #001429)",
          info: "var(--color-info, #48beff)",
          "info-content": "var(--color-info-content, #001429)",
          success: "var(--color-success, #0cf574)",
          "success-content": "var(--color-success-content, #001429)",
          warning: "var(--color-warning, #f18f01)",
          "warning-content": "var(--color-warning-content, #ffffff)",
          error: "var(--color-error, #bf211e)",
          "error-content": "var(--color-error-content, #ffffff)"
        }
      }
    ]
  }
} satisfies Config;
