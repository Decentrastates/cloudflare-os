import { useI18n } from './I18nContext'
import type { SupportedLocale } from './types'

const LANGUAGE_OPTIONS: ReadonlyArray<{ value: SupportedLocale; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
]

export default function LanguageSelector({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()

  return (
    <select
      value={locale}
      onChange={(event) => setLocale(event.target.value as SupportedLocale)}
      aria-label={t('Language')}
      className={`h-8 cursor-pointer rounded-lg border border-kumo-line bg-kumo-base px-2.5 text-[12px] text-kumo-default outline-none transition-colors hover:bg-kumo-tint focus:border-kumo-ring focus:ring-2 focus:ring-kumo-ring/15 ${className}`}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  )
}
