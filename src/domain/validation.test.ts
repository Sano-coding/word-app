import { describe, expect, it } from 'vitest'
import { isValidNickname, isValidWordEntry } from './validation'

describe('isValidNickname', () => {
  it.each([
    ['a', true],
    ['あ', true],
    ['a'.repeat(20), true],
    ['', false],
    ['   ', false],
    ['a'.repeat(21), false],
    ['🐶'.repeat(20), true],
    ['🐶'.repeat(21), false],
  ])('%s -> %s', (value, expected) => {
    expect(isValidNickname(value)).toBe(expected)
  })
})

describe('isValidWordEntry', () => {
  it('accepts non-empty word and meaning', () => {
    expect(isValidWordEntry('apple', 'りんご')).toBe(true)
  })

  it('rejects empty or whitespace-only fields', () => {
    expect(isValidWordEntry('', 'りんご')).toBe(false)
    expect(isValidWordEntry('apple', '  ')).toBe(false)
  })
})
