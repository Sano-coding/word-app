import { describe, expect, it } from 'vitest'
import { toWord, toWordRowPatch } from './wordRepository'

describe('wordRepository row mapping', () => {
  it('converts a snake_case DB row into the camelCase Word type', () => {
    const word = toWord({
      id: 'w1',
      tanchou_id: 't1',
      word: 'apple',
      meaning: 'りんご',
      note: '赤い果物',
      mastery_level: 'memorized',
      flashcard_status: 'shown',
      quiz_status: 'not_shown',
      is_starred: true,
      created_at: '2026-01-01T00:00:00.000Z',
    })

    expect(word).toEqual({
      id: 'w1',
      tanchouId: 't1',
      word: 'apple',
      meaning: 'りんご',
      note: '赤い果物',
      masteryLevel: 'memorized',
      flashcardStatus: 'shown',
      quizStatus: 'not_shown',
      isStarred: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    })
  })

  it('builds a DB patch containing only the given fields', () => {
    expect(toWordRowPatch({ masteryLevel: 'memorized' })).toEqual({ mastery_level: 'memorized' })
    expect(toWordRowPatch({ isStarred: true, note: 'x' })).toEqual({ is_starred: true, note: 'x' })
    expect(toWordRowPatch({})).toEqual({})
  })
})
