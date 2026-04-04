let csrfTokenValue = "";

export async function initCsrfToken(): Promise<string> {
  if (!csrfTokenValue) {
    const { token } = await $fetch<{ token: string }>("/api/csrf-token");
    csrfTokenValue = token;
  }
  return csrfTokenValue;
}

export function getCsrfToken(): string {
  return csrfTokenValue;
}

export function useApiFetch<T>(
  url: string | (() => string),
  opts?: Parameters<typeof useFetch<T>>[1],
) {
  return useFetch<T>(url, {
    ...opts,
    headers: computed(() => ({
      "x-csrf-token": csrfTokenValue,
      ...(opts?.headers as Record<string, string> | undefined),
    })),
  });
}
