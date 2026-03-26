export default defineNuxtPlugin(async (nuxtApp) => {
  // vue3-sfc-loader uses Node.js Buffer internally; polyfill it for the browser
  if (typeof globalThis.Buffer === "undefined") {
    const { Buffer } = await import("buffer");
    globalThis.Buffer = Buffer;
  }

  // vue3-sfc-loader is browser-only; this plugin is client-side only (.client.ts)
  const { loadModule } = await import("vue3-sfc-loader/dist/vue3-sfc-loader.esm.js");
  nuxtApp.provide("sfcLoader", { loadModule });
});
