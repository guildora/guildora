interface FooterPagePublic {
  id: string;
  slug: string;
  title: string;
  content: string;
}

export function useFooterPages() {
  const config = useRuntimeConfig();
  const hubUrl = String(config.public.hubUrl || "http://localhost:3003").replace(/\/+$/, "");

  async function fetchFooterPages(locale: string): Promise<FooterPagePublic[]> {
    try {
      const data = await $fetch<{ pages: FooterPagePublic[] }>(`${hubUrl}/api/public/footer-pages`, {
        params: { locale }
      });
      return data.pages;
    } catch {
      if (import.meta.dev) {
        console.warn("[useFooterPages] Failed to fetch footer pages");
      }
      return [];
    }
  }

  async function fetchFooterPage(slug: string, locale: string): Promise<FooterPagePublic | null> {
    try {
      const data = await $fetch<{ page: FooterPagePublic }>(`${hubUrl}/api/public/footer-pages`, {
        params: { slug, locale }
      });
      return data.page;
    } catch {
      return null;
    }
  }

  return { fetchFooterPages, fetchFooterPage };
}
