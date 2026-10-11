import { describe, expect, it } from 'vitest'
import { findFriendshipWithUser, splitFriendships } from './friendships'
import type { Friendship } from '@/types'

function makeFriendship(overrides: Partial<Friendship>): Friendship {
  return {
    id: 'f1',
    status: 'pending',
    direction: 'incoming',
    createdAt: '2026-01-01T00:00:00.000Z',
    respondedAt: null,
    otherId: 'u1',
    otherNickname: 'たぬきち',
    otherIconType: 'default',
    otherIconValue: null,
    ...overrides,
  }
}

describe('splitFriendships', () => {
  it('buckets by status and direction', () => {
    const accepted = makeFriendship({ id: 'f1', status: 'accepted', otherId: 'u1' })
    const incoming = makeFriendship({ id: 'f2', status: 'pending', direction: 'incoming', otherId: 'u2' })
    const outgoing = makeFriendship({ id: 'f3', status: 'pending', direction: 'outgoing', otherId: 'u3' })

    expect(splitFriendships([accepted, incoming, outgoing])).toEqual({
      friends: [accepted],
      incomingRequests: [incoming],
      outgoingRequests: [outgoing],
    })
  })
})

describe('findFriendshipWithUser', () => {
  it('finds the relationship row matching the given user id', () => {
    const friendship = makeFriendship({ otherId: 'u2' })
    expect(findFriendshipWithUser([friendship], 'u2')).toBe(friendship)
  })

  it('returns undefined when there is no existing relationship', () => {
    const friendship = makeFriendship({ otherId: 'u2' })
    expect(findFriendshipWithUser([friendship], 'u3')).toBeUndefined()
  })
})
