import { test, expect } from 'vitest'
import { clampSource } from './source'

test('keeps pricing', () => {
  expect(clampSource('pricing')).toBe('pricing')
})
test('defaults unknown/undefined to waitlist', () => {
  expect(clampSource('waitlist')).toBe('waitlist')
  expect(clampSource(undefined)).toBe('waitlist')
  expect(clampSource('evil"; DROP TABLE')).toBe('waitlist')
})
