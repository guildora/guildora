import type { LocalePreference, LocaleResolutionSource } from "../../utils/locale-preference";

export type LocaleContextResponse = {
  localePreference: LocalePreference | null;
  communityDefaultLocale: LocalePreference;
  effectiveLocale: LocalePreference;
  localeSource: LocaleResolutionSource;
  hasSession: boolean;
};

export function isLandingContentPath(path: string): boolean {
  void path;
  return false;
}

export function useLocaleContext() {
  const localeContext = useState<LocaleContextResponse | null>("locale-context", () => null);
  const requestFetch = useRequestFetch();

  const refreshLocaleContext = async () => {
    try {
      const response = await requestFetch<LocaleContextResponse>("/api/internal/locale-context", {
        credentials: "include"
      });
      localeContext.value = response;
      return response;
    } catch {
      return null;
    }
  };

  return {
    localeContext,
    refreshLocaleContext
  };
}
