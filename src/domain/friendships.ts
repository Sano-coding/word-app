import type { Friendship } from '@/types'

export function splitFriendships(friendships: Friendship[]) {
  return {
    friends: friendships.filter((f) => f.status === 'accepted'),
    incomingRequests: friendships.filter((f) => f.status === 'pending' && f.direction === 'incoming'),
    outgoingRequests: friendships.filter((f) => f.status === 'pending' && f.direction === 'outgoing'),
  }
}

/** 検索結果のユーザーと既に関係（フレンド／申請中）があるかを調べる */
export function findFriendshipWithUser(friendships: Friendship[], otherId: string): Friendship | undefined {
  return friendships.find((f) => f.otherId === otherId)
}
