import { describe, expect, it } from 'vitest'
import { isQuotaExceededError } from './storage'

describe('isQuotaExceededError', () => {
  it('recognizes a QuotaExceededError DOMException', () => {
    expect(isQuotaExceededError(new DOMException('quota exceeded', 'QuotaExceededError'))).toBe(true)
  })

  it('recognizes the legacy Firefox quota error name', () => {
    expect(isQuotaExceededError(new DOMException('quota exceeded', 'NS_ERROR_DOM_QUOTA_REACHED'))).toBe(true)
  })

  it('rejects unrelated errors', () => {
    expect(isQuotaExceededError(new Error('boom'))).toBe(false)
    expect(isQuotaExceededError(new DOMException('other', 'NotFoundError'))).toBe(false)
    expect(isQuotaExceededError(null)).toBe(false)
  })
})
