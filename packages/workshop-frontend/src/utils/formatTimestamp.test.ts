import { describe, expect, it } from 'vitest'
import { setActiveLocale } from '../i18n/core'
import { formatFullTimestamp } from './formatTimestamp'

describe('formatFullTimestamp', () => {
  it('uses the selected interface locale and refreshes its cached formatter', () => {
    const date = new Date(2026, 4, 11, 17, 9)

    setActiveLocale('en')
    const english = formatFullTimestamp(date)
    setActiveLocale('zh-TW')
    const traditionalChinese = formatFullTimestamp(date)

    expect(english).not.toBe(traditionalChinese)
    expect(traditionalChinese).toContain('下午')
  })
})
