import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LOCALE_STORAGE_KEY, resolveInitialLocale, setActiveLocale, translate } from './core'
import type { SupportedLocale, TranslationValues } from './types'

interface I18nContextValue {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  t: (message: string, values?: TranslationValues) => string
  formatDateTime: (date: Date | number, options?: Intl.DateTimeFormatOptions) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getInitialLocale(): SupportedLocale {
  return resolveInitialLocale(
    typeof window === 'undefined' ? null : window.localStorage,
    typeof navigator === 'undefined' ? [] : navigator.languages,
  )
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(getInitialLocale)
  setActiveLocale(locale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((nextLocale: SupportedLocale) => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    setLocaleState(nextLocale)
  }, [])

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (message, values) => translate(locale, message, values),
    formatDateTime: (date, options) => new Intl.DateTimeFormat(locale, options).format(date),
  }), [locale, setLocale])

  return (
    <I18nContext.Provider value={value}>
      <Fragment key={locale}>{children}</Fragment>
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}
