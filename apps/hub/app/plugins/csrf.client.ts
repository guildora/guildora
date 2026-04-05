import { initCsrfToken, getCsrfToken } from "~/composables/useCsrfFetch";

export default defineNuxtPlugin(async (nuxtApp) => {
  await initCsrfToken();

  const fetchWithCsrf = $fetch.create({
    onRequest({ options }) {
      const token = getCsrfToken();
      if (!token) return;
      // Build a proper Headers object so we handle all input shapes correctly
      const headers = new Headers(options.headers as HeadersInit | undefined);
      if (!headers.has("x-csrf-token")) {
        headers.set("x-csrf-token", token);
      }
      options.headers = headers;
    },
  });

  // Replace both globalThis.$fetch (direct calls) and nuxtApp.$fetch
  // (used internally by useFetch / useRequestFetch on the client).
  globalThis.$fetch = fetchWithCsrf;
  (nuxtApp as Record<string, unknown>).$fetch = fetchWithCsrf;
});
