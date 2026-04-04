import { initCsrfToken, getCsrfToken } from "~/composables/useCsrfFetch";

export default defineNuxtPlugin(async () => {
  await initCsrfToken();

  const originalFetch = globalThis.$fetch;
  globalThis.$fetch = new Proxy(originalFetch, {
    apply(target, thisArg, [url, opts = {}]) {
      const token = getCsrfToken();
      if (!token) {
        return Reflect.apply(target, thisArg, [url, opts]);
      }
      const updatedOpts = {
        ...opts,
        headers: {
          "x-csrf-token": token,
          ...(opts.headers as Record<string, string> | undefined),
        },
      };
      return Reflect.apply(target, thisArg, [url, updatedOpts]);
    },
  });
});
