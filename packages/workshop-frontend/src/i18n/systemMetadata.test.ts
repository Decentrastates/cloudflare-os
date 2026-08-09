import { describe, expect, it } from 'vitest'
import { translateSystemMetadata } from '@gadgets/workshop-shared/i18n'

describe('translateSystemMetadata', () => {
  it('localizes built-in blueprint and output metadata', () => {
    expect(translateSystemMetadata('zh-CN', 'Workspace Docs')).toBe('工作区文档')
    expect(translateSystemMetadata('zh-TW', 'Workspace Sheets')).toBe('工作區試算表')
    expect(translateSystemMetadata('zh-CN', 'Apps')).toBe('应用')
    expect(translateSystemMetadata('zh-TW', 'Slides')).toBe('簡報')
  })

  it('localizes gatekeeper taglines and supported resources', () => {
    expect(translateSystemMetadata('zh-CN', 'Trigger gadgets from incoming email'))
      .toBe('通过收到的电子邮件触发工作组件')
    expect(translateSystemMetadata('zh-TW', 'GitHub Pull Request')).toBe('GitHub 拉取請求')
    expect(translateSystemMetadata('zh-CN', 'Read emails and apply labels.'))
      .toBe('读取电子邮件并应用标签。')
  })

  it('preserves brand names and unknown user-provided values', () => {
    expect(translateSystemMetadata('zh-CN', 'GitHub')).toBe('GitHub')
    expect(translateSystemMetadata('zh-TW', 'Quarterly planning workspace')).toBe('Quarterly planning workspace')
  })
})
