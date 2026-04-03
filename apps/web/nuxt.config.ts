export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        "data-theme": "guildora-dark"
      }
    }
  },
  modules: ["@nuxtjs/i18n", "@nuxtjs/tailwindcss", "@nuxt/eslint", "@nuxt/icon"],
  components: {
    dirs: [
      { path: "~/components/landing/blocks", prefix: "LandingBlocks", pathPrefix: false, global: true },
      { path: "~/components", pathPrefix: false }
    ]
  },
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      appName: "Guildora",
      appUrl: process.env.NUXT_PUBLIC_APP_URL || "http://localhost:3000",
      hubUrl: process.env.NUXT_PUBLIC_HUB_URL || "http://localhost:3003"
    }
  },
  i18n: {
    strategy: "prefix_except_default",
    defaultLocale: "en",
    locales: [
      { code: "en", language: "en-US", file: "en.json", name: "English" },
      { code: "de", language: "de-DE", file: "de.json", name: "Deutsch" }
    ],
    lazy: true,
    langDir: "locales",
    vueI18n: "./i18n.config.ts",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "guildora_i18n",
      redirectOn: "root"
    },
    experimental: {
      localeDetector: "localeDetector.ts"
    }
  },
  compatibilityDate: "2025-01-01"
});
