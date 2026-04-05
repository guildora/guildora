interface LandingSection {
  id: string;
  blockType: string;
  sortOrder: number;
  config: Record<string, unknown>;
  content: Record<string, unknown>;
}

interface LandingColorPalette {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  border: string;
}

interface LandingPageData {
  sections: LandingSection[];
  template: { id: string; name: string } | null;
  customCss: string | null;
  meta: {
    title?: string;
    description?: string;
  };
  colors: LandingColorPalette | null;
}

export function useLanding() {
  const config = useRuntimeConfig();
  const hubUrl = String(config.public.hubUrl || "http://localhost:3003").replace(/\/+$/, "");

  async function fetchLandingPage(locale: "en" | "de"): Promise<LandingPageData | null> {
    try {
      const data = await $fetch<LandingPageData>(`${hubUrl}/api/public/landing`, {
        params: { locale }
      });
      return data;
    } catch (error) {
      if (import.meta.dev) {
        console.warn("[useLanding] Failed to fetch landing page:", error);
      }
      return null;
    }
  }

  return { fetchLandingPage };
}
