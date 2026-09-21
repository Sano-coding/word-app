import { describe, expect, it } from 'vitest'
import { buildSessionQueue, filterWords, orderWords } from './sessionQueue'
import type { Word } from '@/types'

function makeWord(partial: Partial<Word>): Word {
  return {
    id: partial.id ?? 'id',
    tanchouId: 'tanchou-1',
    word: partial.word ?? 'word',
    meaning: 'meaning',
    masteryLevel: 'not_memorized',
    flashcardStatus: 'not_shown',
    quizStatus: 'not_shown',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...partial,
  }
}

describe('filterWords', () => {
  const words = [
    makeWord({ id: '1', masteryLevel: 'not_memorized', flashcardStatus: 'not_shown' }),
    makeWord({ id: '2', masteryLevel: 'memorized', flashcardStatus: 'shown' }),
    makeWord({ id: '3', masteryLevel: 'partially_memorized', flashcardStatus: 'not_shown' }),
  ]

  it('matches everything when both filter axes are empty', () => {
    expect(filterWords(words, { masteryLevels: [], statuses: [] }, 'flashcardStatus')).toHaveLength(3)
  })

  it('filters by masteryLevel only', () => {
    const result = filterWords(words, { masteryLevels: ['memorized'], statuses: [] }, 'flashcardStatus')
    expect(result.map((w) => w.id)).toEqual(['2'])
  })

  it('combines masteryLevel and status filters with AND', () => {
    const result = filterWords(
      words,
      { masteryLevels: ['not_memorized', 'partially_memorized'], statuses: ['not_shown'] },
      'flashcardStatus',
    )
    expect(result.map((w) => w.id)).toEqual(['1', '3'])
  })
})

describe('orderWords', () => {
  const words = [
    makeWord({ id: '1', createdAt: '2024-01-02T00:00:00.000Z' }),
    makeWord({ id: '2', createdAt: '2024-01-01T00:00:00.000Z' }),
  ]

  it('sorts by createdAt ascending for registration order', () => {
    expect(orderWords(words, 'registration').map((w) => w.id)).toEqual(['2', '1'])
  })

  it('random order returns all the same items (order not asserted)', () => {
    const result = orderWords(words, 'random')
    expect(result.map((w) => w.id).sort()).toEqual(['1', '2'])
  })
})

describe('buildSessionQueue', () => {
  it('filters, orders, then slices to the requested count', () => {
    const words = [
      makeWord({ id: '1', createdAt: '2024-01-01T00:00:00.000Z', masteryLevel: 'not_memorized' }),
      makeWord({ id: '2', createdAt: '2024-01-02T00:00:00.000Z', masteryLevel: 'not_memorized' }),
      makeWord({ id: '3', createdAt: '2024-01-03T00:00:00.000Z', masteryLevel: 'memorized' }),
    ]
    const queue = buildSessionQueue(
      words,
      { masteryLevels: ['not_memorized'], statuses: [] },
      'flashcardStatus',
      'registration',
      1,
    )
    expect(queue.map((w) => w.id)).toEqual(['1'])
  })

  it('returns fewer items than count when the filtered pool is smaller', () => {
    const words = [makeWord({ id: '1' })]
    const queue = buildSessionQueue(words, { masteryLevels: [], statuses: [] }, 'flashcardStatus', 'registration', 10)
    expect(queue).toHaveLength(1)
  })
})
