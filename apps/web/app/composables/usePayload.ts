type CmsPage = {
  docs: Array<{
    title: string;
    slug: string;
    status: "draft" | "published";
    layout: Array<Record<string, unknown>>;
    seo?: {
      title?: string;
      description?: string;
      keywords?: string;
    };
  }>;
};

export function usePayload() {
  const config = useRuntimeConfig();

  const cmsBaseUrl = (() => {
    const raw = typeof config.public.cmsUrl === "string" ? config.public.cmsUrl.trim() : "";
    if (!raw) return "http://localhost:3002";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    return `http://${raw}`;
  })();

  const fetchLandingPage = async (locale: "en" | "de") => {
    try {
      const endpoint = new URL("/api/pages", cmsBaseUrl);
      endpoint.searchParams.set("where[slug][equals]", "landing");
      endpoint.searchParams.set("where[status][equals]", "published");
      endpoint.searchParams.set("limit", "1");
      endpoint.searchParams.set("locale", locale);
      endpoint.searchParams.set("fallback-locale", "en");
      endpoint.searchParams.set("depth", "2");
      const result = await $fetch<CmsPage>(endpoint.toString());
      return result.docs?.[0] || null;
    } catch (e) {
      if (import.meta.dev) {
        console.warn("[usePayload] CMS not reachable, fallback view will be shown:", (e as Error)?.message ?? e);
      }
      return null;
    }
  };

  return {
    fetchLandingPage,
    cmsBaseUrl
  };
}
