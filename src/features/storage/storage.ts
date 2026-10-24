/**
 * Pure, runtime-agnostic storage helpers — no R2/Workers imports — so they're
 * unit-testable in the node pool and safe to import from the client bundle.
 *
 * Validation lives here (not in storage.server.ts) so the same rules guard the
 * browser-side picker and the server handler without duplication.
 */

/** Max avatar size. R2 is cheap, but an avatar has no business being huge. */
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024 // 2 MB

const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const
export type AvatarType = (typeof ALLOWED_AVATAR_TYPES)[number]

/** `accept` attribute for the file <input>, derived from the allow-list. */
export const AVATAR_ACCEPT = ALLOWED_AVATAR_TYPES.join(',')

/**
 * R2 object key for a user's avatar. One key per user — re-upload overwrites,
 * so we never accumulate orphaned objects and never need to track old keys.
 */
export function avatarObjectKey(userId: string): string {
  return `avatars/${userId}`
}

export type AvatarReason = 'empty' | 'type' | 'size'
export type AvatarValidation = { ok: true } | { ok: false; reason: AvatarReason }

/** Validate an avatar candidate by MIME type and byte size. Pure. */
export function validateAvatar(input: { type: string; size: number }): AvatarValidation {
  if (input.size === 0) return { ok: false, reason: 'empty' }
  if (!ALLOWED_AVATAR_TYPES.includes(input.type as AvatarType)) return { ok: false, reason: 'type' }
  if (input.size > MAX_AVATAR_BYTES) return { ok: false, reason: 'size' }
  return { ok: true }
}
