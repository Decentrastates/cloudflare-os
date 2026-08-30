// @vitest-environment jsdom

import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LOCALE_STORAGE_KEY } from './core'
import { I18nProvider } from './I18nContext'
import LanguageSelector from './LanguageSelector'

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('LanguageSelector', () => {
  let root: Root | undefined
  let container: HTMLDivElement | undefined

  beforeEach(() => localStorage.clear())

  afterEach(() => {
    act(() => root?.unmount())
    container?.remove()
  })

  it('offers all locales and applies a selection without navigation or reload', async () => {
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    await act(async () => root!.render(<I18nProvider><LanguageSelector /></I18nProvider>))

    const select = container.querySelector('select')!
    expect(Array.from(select.options).map((option) => option.text)).toEqual([
      'English',
      '简体中文',
      '繁體中文',
    ])

    await act(async () => {
      select.value = 'zh-CN'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(container.querySelector('select')!.getAttribute('aria-label')).toBe('语言')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('zh-CN')
  })
})
