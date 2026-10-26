import { describe, expect, it } from 'vitest'
import { toFriendDashboard, toFriendship } from './friendshipRepository'

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
      other_status_message: '英検準1級を目指して勉強中！',
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
      otherStatusMessage: '英検準1級を目指して勉強中！',
    })
  })
})

describe('toFriendDashboard', () => {
  it('returns only isPublic: false when the friend keeps the dashboard private', () => {
    expect(toFriendDashboard({ is_public: false })).toEqual({ isPublic: false })
  })

  it('converts the RPC result into camelCase tanchous and snapshots', () => {
    const dashboard = toFriendDashboard({
      is_public: true,
      tanchous: [
        {
          name: '英検準1級',
          last_studied_at: '2026-10-25T03:00:00.000Z',
          words: [{ mastery_level: 'memorized', flashcard_status: 'shown', quiz_status: 'not_shown' }],
        },
      ],
      snapshots: [
        { snapshot_date: '2026-10-25', not_memorized_count: 1, partially_memorized_count: 2, memorized_count: 3 },
      ],
    })

    expect(dashboard).toEqual({
      isPublic: true,
      tanchous: [
        {
          name: '英検準1級',
          lastStudiedAt: '2026-10-25T03:00:00.000Z',
          words: [{ masteryLevel: 'memorized', flashcardStatus: 'shown', quizStatus: 'not_shown' }],
        },
      ],
      snapshots: [{ date: '2026-10-25', notMemorized: 1, partiallyMemorized: 2, memorized: 3 }],
    })
  })
})
