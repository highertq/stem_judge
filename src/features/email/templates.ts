import { dictionaries, type Locale } from '@/features/i18n/locale'

interface RenderInput {
  template: 'verify-email' | 'reset-password' | 'pro-activated'
  locale: Locale
  data: { url: string }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function renderEmail(input: RenderInput): Promise<{ subject: string; html: string; text: string }> {
  const dict = dictionaries[input.locale]
  const k =
    input.template === 'verify-email' ? dict.email.verify
    : input.template === 'reset-password' ? dict.email.reset
    : dict.email.proActivated
  const url = input.data.url
  const html = `<!doctype html><html><body style="font-family:sans-serif;background:#f6f6f6">
<div style="max-width:480px;margin:24px auto;padding:24px;background:#fff;border-radius:8px">
<h1>${esc(k.heading)}</h1><p>${esc(k.body)}</p>
<p><a href="${esc(url)}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">${esc(k.button)}</a></p>
<p style="color:#888;font-size:12px">${esc(url)}</p></div></body></html>`
  const text = `${k.heading}\n\n${k.body}\n${url}`
  return { subject: k.subject, html, text }
}
