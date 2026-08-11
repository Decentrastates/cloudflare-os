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

  it('keeps the Bug OS brand in backend-localized connector descriptions', () => {
    const source = 'Give Bug OS an email address it can receive messages from. Useful for triage agents, ticket-from-email workflows, or anything driven by mail.'

    expect(translateSystemMetadata('en', source)).toBe(source)
    expect(translateSystemMetadata('zh-CN', source))
      .toBe('为 Bug OS 提供一个可接收邮件的地址。适用于分类处理智能体、邮件转工单流程以及任何由邮件驱动的工作。')
    expect(translateSystemMetadata('zh-TW', source))
      .toBe('為 Bug OS 提供一個可接收郵件的地址。適用於分類處理代理程式、郵件轉工單流程，以及任何由郵件驅動的工作。')
  })

  it('preserves brand names and unknown user-provided values', () => {
    expect(translateSystemMetadata('zh-CN', 'GitHub')).toBe('GitHub')
    expect(translateSystemMetadata('zh-TW', 'Quarterly planning workspace')).toBe('Quarterly planning workspace')
  })
})
