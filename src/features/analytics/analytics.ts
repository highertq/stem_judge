import { createServerFn } from '@tanstack/react-start'

/**
 * Cloudflare Web Analytics beacon token (public). Returns null when unset, so
 * the beacon is simply not injected — privacy-friendly, free, zero-config, and
 * degrades gracefully like every other optional integration.
 *
 * Get a token at: Cloudflare dashboard → Analytics & Logs → Web Analytics.
 */
export const getAnalyticsToken = createServerFn({ method: 'GET' }).handler(
  async (): Promise<string | null> => {
    // Lazy env import (repo convention): keeps cloudflare:workers out of node test graphs.
    const { env } = await import('@/lib/env')
    return env.CF_ANALYTICS_TOKEN || null
  },
)
