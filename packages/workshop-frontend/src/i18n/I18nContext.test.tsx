// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LOCALE_STORAGE_KEY } from './core'
import { I18nProvider, useI18n } from './I18nContext'

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('I18nProvider', () => {
  let root: Root | undefined
  let container: HTMLDivElement | undefined

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = ''
  })

  afterEach(() => {
    act(() => root?.unmount())
    container?.remove()
  })

  it('uses stored locale and updates copy, persistence, and document language live', async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-TW')

    function Probe() {
      const { locale, setLocale, t } = useI18n()
      return (
        <button type="button" onClick={() => setLocale('zh-CN')}>
          {locale}:{t('Welcome, {{name}}', { name: 'Ada' })}
        </button>
      )
    }

    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    await act(async () => root!.render(<I18nProvider><Probe /></I18nProvider>))

    expect(container.textContent).toBe('zh-TW:歡迎，Ada')
    expect(document.documentElement.lang).toBe('zh-TW')

    await act(async () => container!.querySelector('button')!.click())

    expect(container.textContent).toBe('zh-CN:欢迎，Ada')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('zh-CN')
    expect(document.documentElement.lang).toBe('zh-CN')
  })
})
