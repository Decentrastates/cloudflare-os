export const SUPPORTED_LOCALES = ['en', 'zh-CN', 'zh-TW'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export type TranslationValues = Record<string, string | number>
export type TranslationCatalog = Readonly<Record<string, string>>

export function isSupportedLocale(value: string | null): value is SupportedLocale {
  return value !== null && SUPPORTED_LOCALES.includes(value as SupportedLocale)
}
