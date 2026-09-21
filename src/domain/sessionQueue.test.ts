import { describe, expect, it } from 'vitest'
import { buildSessionQueue, filterWords, orderWords } from './sessionQueue'
import type { SessionFilter } from './sessionQueue'
import type { Word } from '@/types'

function makeWord(partial: Partial<Word>): Word {
  return {
    id: partial.id ?? 'id',
    tanchouId: 'tanchou-1',
    word: partial.word ?? 'word',
    meaning: 'meaning',
    note: '',
    masteryLevel: 'not_memorized',
    flashcardStatus: 'not_shown',
    quizStatus: 'not_shown',
    isStarred: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...partial,
  }
}

function makeFilter(partial: Partial<SessionFilter> = {}): SessionFilter {
  return { masteryLevels: [], statuses: [], starredOnly: false, ...partial }
}

describe('filterWords', () => {
  const words = [
    makeWord({ id: '1', masteryLevel: 'not_memorized', flashcardStatus: 'not_shown' }),
    makeWord({ id: '2', masteryLevel: 'memorized', flashcardStatus: 'shown', isStarred: true }),
    makeWord({ id: '3', masteryLevel: 'partially_memorized', flashcardStatus: 'not_shown', isStarred: true }),
  ]

  it('matches everything when all filter axes are empty/off', () => {
    expect(filterWords(words, makeFilter(), 'flashcardStatus')).toHaveLength(3)
  })

  it('filters by masteryLevel only', () => {
    const result = filterWords(words, makeFilter({ masteryLevels: ['memorized'] }), 'flashcardStatus')
    expect(result.map((w) => w.id)).toEqual(['2'])
  })

  it('combines masteryLevel and status filters with AND', () => {
    const result = filterWords(
      words,
      makeFilter({ masteryLevels: ['not_memorized', 'partially_memorized'], statuses: ['not_shown'] }),
      'flashcardStatus',
    )
    expect(result.map((w) => w.id)).toEqual(['1', '3'])
  })

  it('filters by starredOnly', () => {
    const result = filterWords(words, makeFilter({ starredOnly: true }), 'flashcardStatus')
    expect(result.map((w) => w.id)).toEqual(['2', '3'])
  })

  it('combines starredOnly with masteryLevel filter using AND', () => {
    const result = filterWords(
      words,
      makeFilter({ masteryLevels: ['partially_memorized'], starredOnly: true }),
      'flashcardStatus',
    )
    expect(result.map((w) => w.id)).toEqual(['3'])
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
      makeFilter({ masteryLevels: ['not_memorized'] }),
      'flashcardStatus',
      'registration',
      1,
    )
    expect(queue.map((w) => w.id)).toEqual(['1'])
  })

  it('returns fewer items than count when the filtered pool is smaller', () => {
    const words = [makeWord({ id: '1' })]
    const queue = buildSessionQueue(words, makeFilter(), 'flashcardStatus', 'registration', 10)
    expect(queue).toHaveLength(1)
  })
})
