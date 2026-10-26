import { describe, expect, it } from 'vitest'
import { buildDashboardData, computeNiceYAxisMax, countWordsByMastery, getTodayJstDateString, mergeTodaySnapshot } from './dashboardStats'
import type { Word } from '@/types'

function makeWord(masteryLevel: Word['masteryLevel']): Word {
  return {
    id: crypto.randomUUID(),
    tanchouId: 't1',
    word: 'word',
    meaning: 'meaning',
    note: '',
    masteryLevel,
    flashcardStatus: 'not_shown',
    quizStatus: 'not_shown',
    isStarred: false,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
  }
}

describe('countWordsByMastery', () => {
  it('counts words per mastery level', () => {
    const words = [makeWord('memorized'), makeWord('memorized'), makeWord('partially_memorized'), makeWord('not_memorized')]
    expect(countWordsByMastery(words)).toEqual({ not_memorized: 1, partially_memorized: 1, memorized: 2 })
  })

  it('returns all-zero counts for an empty list', () => {
    expect(countWordsByMastery([])).toEqual({ not_memorized: 0, partially_memorized: 0, memorized: 0 })
  })
})

describe('getTodayJstDateString', () => {
  it('converts a UTC instant to the JST calendar date', () => {
    // 2026-10-08T15:30:00Z -> JST は 2026-10-09T00:30:00
    expect(getTodayJstDateString(new Date('2026-10-08T15:30:00Z'))).toBe('2026-10-09')
  })

  it('keeps the same calendar date when JST offset does not cross midnight', () => {
    // 2026-10-08T03:00:00Z -> JST は 2026-10-08T12:00:00
    expect(getTodayJstDateString(new Date('2026-10-08T03:00:00Z'))).toBe('2026-10-08')
  })
})

describe('mergeTodaySnapshot', () => {
  const current = { not_memorized: 5, partially_memorized: 2, memorized: 10 }

  it('appends today when history has no entry for today', () => {
    const history = [{ date: '2026-10-06', notMemorized: 8, partiallyMemorized: 1, memorized: 8 }]
    const result = mergeTodaySnapshot(history, '2026-10-08', current)
    expect(result).toEqual([
      { date: '2026-10-06', notMemorized: 8, partiallyMemorized: 1, memorized: 8 },
      { date: '2026-10-08', notMemorized: 5, partiallyMemorized: 2, memorized: 10 },
    ])
  })

  it('overwrites the last entry when it already is today', () => {
    const history = [{ date: '2026-10-08', notMemorized: 99, partiallyMemorized: 99, memorized: 99 }]
    const result = mergeTodaySnapshot(history, '2026-10-08', current)
    expect(result).toEqual([{ date: '2026-10-08', notMemorized: 5, partiallyMemorized: 2, memorized: 10 }])
  })

  it('adds today as the only entry when history is empty', () => {
    const result = mergeTodaySnapshot([], '2026-10-08', current)
    expect(result).toEqual([{ date: '2026-10-08', notMemorized: 5, partiallyMemorized: 2, memorized: 10 }])
  })
})

describe('computeNiceYAxisMax', () => {
  it('rounds up to a clean step/max pair', () => {
    expect(computeNiceYAxisMax(97)).toEqual({ max: 100, step: 20 })
    expect(computeNiceYAxisMax(42)).toEqual({ max: 50, step: 10 })
    expect(computeNiceYAxisMax(8)).toEqual({ max: 8, step: 2 })
  })

  it('falls back to a small fixed scale when there is no data', () => {
    expect(computeNiceYAxisMax(0)).toEqual({ max: 5, step: 1.25 })
  })
})

describe('buildDashboardData', () => {
  it('aggregates counts, study status and tanchou trends from minimal word states', () => {
    const tanchous = [
      { name: 'A', lastStudiedAt: '2026-10-20T00:00:00.000Z' },
      { name: 'B', lastStudiedAt: '2026-10-25T00:00:00.000Z' },
    ]
    const wordsByTanchou = [
      [
        { masteryLevel: 'memorized' as const, flashcardStatus: 'shown' as const, quizStatus: 'shown' as const },
        { masteryLevel: 'not_memorized' as const, flashcardStatus: 'shown' as const, quizStatus: 'not_shown' as const },
      ],
      [{ masteryLevel: 'partially_memorized' as const, flashcardStatus: 'not_shown' as const, quizStatus: 'shown' as const }],
    ]

    const data = buildDashboardData(tanchous, wordsByTanchou, [], '2026-10-26')

    expect(data.counts).toEqual({ not_memorized: 1, partially_memorized: 1, memorized: 1 })
    expect(data.flashcardStatus).toEqual({ shown: 2, notShown: 1 })
    expect(data.quizStatus).toEqual({ shown: 2, notShown: 1 })
    expect(data.mostActive).toEqual({ tanchouName: 'A', shownCount: 3 })
    expect(data.mostRecent).toEqual({ tanchouName: 'B', lastStudiedAt: '2026-10-25T00:00:00.000Z' })
    expect(data.history).toEqual([{ date: '2026-10-26', notMemorized: 1, partiallyMemorized: 1, memorized: 1 }])
  })

  it('returns null trends when nothing has been studied', () => {
    const data = buildDashboardData([{ name: 'A', lastStudiedAt: null }], [[]], [], '2026-10-26')
    expect(data.mostActive).toBeNull()
    expect(data.mostRecent).toBeNull()
  })
})
