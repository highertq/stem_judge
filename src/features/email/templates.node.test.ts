import { test, expect } from 'vitest'
import { renderEmail } from '@/features/email/templates'

test('verify-email 模板渲染 i18n 文案 + 注入链接', async () => {
  const out = await renderEmail({ template: 'verify-email', locale: 'en', data: { url: 'https://app/verify?token=abc' } })
  expect(out.subject).toBe('Verify your email')
  expect(out.html).toContain('https://app/verify?token=abc')
  expect(out.html).toContain('Verify email')
  expect(out.text).toContain('https://app/verify?token=abc')
})

test('reset-password 模板支持中文', async () => {
  const out = await renderEmail({ template: 'reset-password', locale: 'zh', data: { url: 'https://app/reset?token=xyz' } })
  expect(out.subject).toBe('重置你的密码')
  expect(out.html).toContain('https://app/reset?token=xyz')
})

test('renderEmail: pro-activated renders subject/html/text with the url', async () => {
  const r = await renderEmail({ template: 'pro-activated', locale: 'en', data: { url: 'https://example.com/app' } })
  expect(r.subject).toBeTruthy()
  expect(r.html).toContain('https://example.com/app')
  expect(r.text).toContain('https://example.com/app')
})
