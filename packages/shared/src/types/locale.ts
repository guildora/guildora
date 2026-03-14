export const localeCodes = ["en", "de"] as const;

export type LocaleCode = (typeof localeCodes)[number];
export type UserLocalePreference = LocaleCode | null;
export type CommunityDefaultLocale = LocaleCode;
