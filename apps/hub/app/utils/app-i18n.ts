export type AppTranslateFn = (key: string, ...args: unknown[]) => string;
export type AppTranslationExistsFn = (key: string) => boolean;

export function createAppFirstTranslator(options: {
  appT: AppTranslateFn;
  appTe: AppTranslationExistsFn;
  globalT: AppTranslateFn;
}): AppTranslateFn {
  return (key: string, ...args: unknown[]) => {
    if (options.appTe(key)) {
      return options.appT(key, ...args);
    }
    return options.globalT(key, ...args);
  };
}

export function normalizeAppMessages(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }
  return input as Record<string, unknown>;
}
