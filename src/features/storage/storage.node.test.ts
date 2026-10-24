import { test, expect } from 'vitest'
import { validateAvatar, avatarObjectKey, MAX_AVATAR_BYTES } from './storage'

test('avatarObjectKey is one stable key per user (re-upload overwrites)', () => {
  expect(avatarObjectKey('user-123')).toBe('avatars/user-123')
})

test('accepts an allowed type within the size limit', () => {
  expect(validateAvatar({ type: 'image/png', size: 1024 })).toEqual({ ok: true })
  expect(validateAvatar({ type: 'image/webp', size: MAX_AVATAR_BYTES })).toEqual({ ok: true })
})

test('rejects empty file', () => {
  expect(validateAvatar({ type: 'image/png', size: 0 })).toEqual({ ok: false, reason: 'empty' })
})

test('rejects unsupported type', () => {
  expect(validateAvatar({ type: 'application/pdf', size: 10 })).toEqual({ ok: false, reason: 'type' })
  expect(validateAvatar({ type: 'image/svg+xml', size: 10 })).toEqual({ ok: false, reason: 'type' })
})

test('rejects oversized file', () => {
  expect(validateAvatar({ type: 'image/jpeg', size: MAX_AVATAR_BYTES + 1 })).toEqual({
    ok: false,
    reason: 'size',
  })
})

test('size check runs only after type check (empty beats type beats size)', () => {
  // empty wins even with a bad type
  expect(validateAvatar({ type: 'application/pdf', size: 0 }).ok).toBe(false)
  expect(validateAvatar({ type: 'application/pdf', size: 0 })).toEqual({ ok: false, reason: 'empty' })
})
