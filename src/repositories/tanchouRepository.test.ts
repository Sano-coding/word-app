import { describe, expect, it } from 'vitest'
import { toTanchou } from './tanchouRepository'

describe('tanchouRepository row mapping', () => {
  it('converts a snake_case DB row into the camelCase Tanchou type', () => {
    const tanchou = toTanchou({
      id: 't1',
      account_id: 'a1',
      name: '英検３級',
      is_starred: true,
      visibility: 'private',
      created_at: '2026-01-01T00:00:00.000Z',
    })

    expect(tanchou).toEqual({
      id: 't1',
      accountId: 'a1',
      name: '英検３級',
      isStarred: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      visibility: 'private',
    })
  })
})
