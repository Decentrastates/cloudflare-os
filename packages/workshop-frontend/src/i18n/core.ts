import en from './catalogs/en'
import zhCN from './catalogs/zh-CN'
import zhTW from './catalogs/zh-TW'
import { isSupportedLocale, type SupportedLocale, type TranslationCatalog, type TranslationValues } from './types'

export const LOCALE_STORAGE_KEY = 'cloudflare-os.locale.v1'

const catalogs: Record<SupportedLocale, TranslationCatalog> = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
}

const TRADITIONAL_CHINESE_REGIONS = new Set(['TW', 'HK', 'MO'])
let activeLocale: SupportedLocale = 'en'

export function normalizeLocale(value: string | null | undefined): SupportedLocale {
  if (!value) return 'en'

  const normalized = value.replace('_', '-')
  const parts = normalized.split('-')
  const language = parts[0]?.toLowerCase()
  if (language !== 'zh') return 'en'

  const variants = parts.slice(1).map((part) => part.toUpperCase())
  if (variants.includes('HANT') || variants.some((part) => TRADITIONAL_CHINESE_REGIONS.has(part))) {
    return 'zh-TW'
  }

  return 'zh-CN'
}

function supportedBrowserLocale(value: string): SupportedLocale | null {
  const language = value.split(/[-_]/, 1)[0]?.toLowerCase()
  if (language === 'zh') return normalizeLocale(value)
  if (language === 'en') return 'en'
  return null
}

export function resolveInitialLocale(
  storage: Pick<Storage, 'getItem'> | null,
  browserLanguages: readonly string[],
): SupportedLocale {
  const stored = storage?.getItem(LOCALE_STORAGE_KEY) ?? null
  if (isSupportedLocale(stored)) return stored

  for (const language of browserLanguages) {
    const locale = supportedBrowserLocale(language)
    if (locale) return locale
  }

  return 'en'
}

function interpolate(message: string, values: TranslationValues = {}): string {
  return message.replace(/\{\{(\w+)\}\}/g, (placeholder, name: string) => {
    const value = values[name]
    return value === undefined ? placeholder : String(value)
  })
}

export function translate(
  locale: SupportedLocale,
  message: string,
  values?: TranslationValues,
): string {
  const translated = catalogs[locale][message] ?? catalogs.en[message] ?? message
  return interpolate(translated, values)
}

export function setActiveLocale(locale: SupportedLocale): void {
  activeLocale = locale
}

export function getActiveLocale(): SupportedLocale {
  return activeLocale
}

export function t(message: string, values?: TranslationValues): string {
  return translate(activeLocale, message, values)
}
