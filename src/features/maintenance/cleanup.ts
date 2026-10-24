import { and, isNotNull, lt } from 'drizzle-orm'
import type { DB } from '@/db/client'
import { session, verification, rateLimit } from '@/features/auth/auth.schema'
import { processedWebhookEvents } from '@/features/billing/billing.schema'

/**
 * How long a better-auth `rateLimit` row stays useful. The limiter treats a row
 * as expired once `now - lastRequest` exceeds its (short, ~60s default) window
 * and overwrites it on the next request — so rows older than this are pure cruft
 * and safe to delete. 24h is well beyond any plausible window.
 */
export const RATE_LIMIT_STALE_MS = 24 * 60 * 60 * 1000

/** Webhook 幂等标记的保留期。Stripe 重投窗口最长约 3 天，30 天留足十倍边距；
 *  过期后重复投递已不可能，标记只是死重量。 */
export const WEBHOOK_EVENT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

export interface CleanupResult {
  sessions: number
  verifications: number
  rateLimits: number
  webhookEvents: number
}

/**
 * Delete expired auth rows. Idempotent and safe to run on a schedule (CF Cron).
 * Reference implementation for "scheduled work on Cloudflare" — extend with your
 * own periodic tasks. `now` is injected for testability.
 */
export async function runCleanup(db: DB, now: number): Promise<CleanupResult> {
  const sessions = await db.delete(session).where(lt(session.expiresAt, new Date(now))).returning({ id: session.id })
  const verifications = await db.delete(verification).where(lt(verification.expiresAt, new Date(now))).returning({ id: verification.id })
  const rateLimits = await db
    .delete(rateLimit)
    .where(and(isNotNull(rateLimit.lastRequest), lt(rateLimit.lastRequest, now - RATE_LIMIT_STALE_MS)))
    .returning({ id: rateLimit.id })
  const webhookEvents = await db
    .delete(processedWebhookEvents)
    .where(lt(processedWebhookEvents.processedAt, new Date(now - WEBHOOK_EVENT_RETENTION_MS)))
    .returning({ id: processedWebhookEvents.eventId })

  return { sessions: sessions.length, verifications: verifications.length, rateLimits: rateLimits.length, webhookEvents: webhookEvents.length }
}
