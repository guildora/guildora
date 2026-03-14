export async function fetchPayload<T>(path: string): Promise<T> {
  const config = useRuntimeConfig();
  const baseUrl = config.payloadInternalUrl || config.public.cmsUrl;
  return await $fetch<T>(`${baseUrl}${path}`);
}
