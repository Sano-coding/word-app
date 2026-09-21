import { describe, expect, it } from 'vitest'
import { applyFlashcardLabel, applyQuizAnswer } from './masteryLevel'

describe('applyQuizAnswer', () => {
  it.each([
    ['not_memorized', false, 'not_memorized'],
    ['partially_memorized', false, 'not_memorized'],
    ['memorized', false, 'partially_memorized'],
    ['not_memorized', true, 'partially_memorized'],
    ['partially_memorized', true, 'memorized'],
    ['memorized', true, 'memorized'],
  ] as const)('current=%s correct=%s -> %s', (current, isCorrect, expected) => {
    expect(applyQuizAnswer(current, isCorrect)).toBe(expected)
  })
})

describe('applyFlashcardLabel', () => {
  it('returns the selected label as-is', () => {
    expect(applyFlashcardLabel('memorized')).toBe('memorized')
    expect(applyFlashcardLabel('not_memorized')).toBe('not_memorized')
  })
})
