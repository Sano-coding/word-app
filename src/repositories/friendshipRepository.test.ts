import { describe, expect, it } from 'vitest'
import { toFriendship } from './friendshipRepository'

describe('friendshipRepository row mapping', () => {
  it('converts a snake_case RPC row into the camelCase Friendship type', () => {
    const friendship = toFriendship({
      friendship_id: 'f1',
      status: 'pending',
      direction: 'incoming',
      created_at: '2026-01-01T00:00:00.000Z',
      responded_at: null,
      other_id: 'u1',
      other_nickname: 'たぬきち',
      other_icon_type: 'preset',
      other_icon_value: 'red-panda',
    })

    expect(friendship).toEqual({
      id: 'f1',
      status: 'pending',
      direction: 'incoming',
      createdAt: '2026-01-01T00:00:00.000Z',
      respondedAt: null,
      otherId: 'u1',
      otherNickname: 'たぬきち',
      otherIconType: 'preset',
      otherIconValue: 'red-panda',
    })
  })
})
