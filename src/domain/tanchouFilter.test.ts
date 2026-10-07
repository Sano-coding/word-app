import { describe, expect, it } from 'vitest'
import { countTanchousByStar, filterTanchousByStar } from './tanchouFilter'
import type { Tanchou } from '@/types'

function tanchou(id: string, isStarred: boolean): Tanchou {
  return {
    id,
    accountId: 'account-1',
    name: `単語帳${id}`,
    isStarred,
    createdAt: '2026-10-07T00:00:00.000Z',
    sortOrder: Number(id),
    visibility: 'private',
  }
}

const tanchous = [tanchou('0', true), tanchou('1', false), tanchou('2', true)]

describe('filterTanchousByStar', () => {
  it('returns every tanchou in the original order for "all"', () => {
    expect(filterTanchousByStar(tanchous, 'all').map((t) => t.id)).toEqual(['0', '1', '2'])
  })

  it('returns only starred tanchous for "starred"', () => {
    expect(filterTanchousByStar(tanchous, 'starred').map((t) => t.id)).toEqual(['0', '2'])
  })

  it('returns only unstarred tanchous for "unstarred"', () => {
    expect(filterTanchousByStar(tanchous, 'unstarred').map((t) => t.id)).toEqual(['1'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterTanchousByStar([tanchou('0', true)], 'unstarred')).toEqual([])
    expect(filterTanchousByStar([], 'starred')).toEqual([])
  })
})

describe('countTanchousByStar', () => {
  it('counts each filter target', () => {
    expect(countTanchousByStar(tanchous)).toEqual({ all: 3, starred: 2, unstarred: 1 })
  })

  it('counts zero for an empty list', () => {
    expect(countTanchousByStar([])).toEqual({ all: 0, starred: 0, unstarred: 0 })
  })
})
