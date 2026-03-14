export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        "data-theme": "retromorphism-light"
      }
    }
  },
  modules: ["@nuxtjs/i18n", "@nuxtjs/tailwindcss", "@nuxt/eslint"],
  devtools: { enabled: false },
  css: ["./app/assets/css/main.css"],
  runtimeConfig: {
    public: {
      appName: "NewGuildPlus",
      appUrl: process.env.NUXT_PUBLIC_APP_URL || "http://localhost:3000",
      hubUrl: process.env.NUXT_PUBLIC_HUB_URL || "http://localhost:3003",
      cmsUrl: process.env.NUXT_PUBLIC_CMS_URL || "http://localhost:3002"
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
      cookieKey: "newguildplus_i18n",
      redirectOn: "root"
    }
  },
  compatibilityDate: "2025-01-01"
});
