// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import {
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  resolveInitialLocale,
  translate,
} from './core'
import en from './catalogs/en'
import zhCN from './catalogs/zh-CN'
import zhTW from './catalogs/zh-TW'

describe('normalizeLocale', () => {
  it.each([
    ['zh', 'zh-CN'],
    ['zh-CN', 'zh-CN'],
    ['zh-Hans', 'zh-CN'],
    ['zh-SG', 'zh-CN'],
    ['zh-TW', 'zh-TW'],
    ['zh-Hant', 'zh-TW'],
    ['zh-HK', 'zh-TW'],
    ['zh-MO', 'zh-TW'],
    ['en-US', 'en'],
    ['fr-FR', 'en'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeLocale(input)).toBe(expected)
  })
})

describe('resolveInitialLocale', () => {
  beforeEach(() => localStorage.clear())

  it('prefers a stored supported locale over browser languages', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-TW')

    expect(resolveInitialLocale(localStorage, ['zh-CN'])).toBe('zh-TW')
  })

  it('uses the first browser language that resolves to a supported locale', () => {
    expect(resolveInitialLocale(localStorage, ['fr-FR', 'zh-HK'])).toBe('zh-TW')
  })

  it('falls back to English when storage is invalid and browsers are unsupported', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'invalid')

    expect(resolveInitialLocale(localStorage, ['de-DE'])).toBe('en')
  })
})

describe('translate', () => {
  it('translates known messages and interpolates values', () => {
    expect(translate('zh-CN', 'Welcome, {{name}}', { name: 'Ada' })).toBe('欢迎，Ada')
    expect(translate('zh-TW', 'Welcome, {{name}}', { name: 'Ada' })).toBe('歡迎，Ada')
  })

  it('returns the English message when a translation is unavailable', () => {
    expect(translate('zh-CN', 'Server supplied message')).toBe('Server supplied message')
  })

  it('uses the approved product terminology in both Chinese catalogs', () => {
    expect(translate('zh-CN', 'Sign in')).toBe('登录')
    expect(translate('zh-TW', 'Sign in')).toBe('登入')
    expect(translate('zh-CN', 'Workspaces')).toBe('工作区')
    expect(translate('zh-TW', 'Workspaces')).toBe('工作區')
    expect(translate('zh-CN', 'Gadget')).toBe('Gadget')
    expect(translate('zh-TW', 'Gadget')).toBe('Gadget')
    expect(translate('zh-CN', 'For spawned agents only')).toBe('仅用于派生智能体')
    expect(translate('zh-TW', 'For spawned agents only')).toBe('僅供衍生智慧體使用')
    expect(translate('zh-CN', 'Requesting Slack access — #general, #engineering'))
      .toContain('#general、#engineering')
    expect(translate('zh-TW', 'Requesting Slack access — #general, #engineering'))
      .toContain('#general、#engineering')
  })

  it('keeps destructive and billing actions unambiguous', () => {
    expect(translate('zh-CN', 'Remove workspace')).toBe('移除工作区')
    expect(translate('zh-TW', 'Remove workspace')).toBe('移除工作區')
    expect(translate('zh-CN', ". You can't undo this.")).toContain('无法撤销')
    expect(translate('zh-TW', ". You can't undo this.")).toContain('無法復原')
    expect(translate('zh-CN', 'Add credits to continue.')).toBe('充值以继续。')
    expect(translate('zh-TW', 'Add credits to continue.')).toBe('儲值以繼續。')
  })

  it('rejects known mistranslation terms from generated catalogs', () => {
    const bannedCN = /产卵|特工|经纪人|代理商|代理人|赠款|贷项|阿凡达|装订|公关审查/
    const bannedTW = /產卵|特工|經紀人|代理商|代理人|贈款|貸項|阿凡達|裝訂|公關審查|賬戶|訪問|許可權/

    expect(Object.values(zhCN).filter((value) => bannedCN.test(value))).toEqual([])
    expect(Object.values(zhTW).filter((value) => bannedTW.test(value))).toEqual([])
  })

  it('keeps interpolation placeholders identical across catalogs', () => {
    const placeholders = (message: string) => [...message.matchAll(/\{\{(\w+)\}\}/g)]
      .map((match) => match[1])
      .sort()

    for (const key of Object.keys(en) as Array<keyof typeof en>) {
      expect(placeholders(zhCN[key]), `zh-CN: ${key}`).toEqual(placeholders(key))
      expect(placeholders(zhTW[key]), `zh-TW: ${key}`).toEqual(placeholders(key))
    }
  })
})
