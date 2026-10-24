export type WaitlistSource = 'waitlist' | 'pricing'

/** Server-side allowlist for the client-supplied attribution source. */
export function clampSource(s: string | undefined): WaitlistSource {
  return s === 'pricing' ? 'pricing' : 'waitlist'
}
