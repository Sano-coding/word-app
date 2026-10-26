import { supabase } from '@/lib/supabaseClient'
import { toMasterySnapshot } from './masterySnapshotRepository'
import type { MasterySnapshotRow } from './masterySnapshotRepository'
import type { Friendship, FriendDashboard, IconType, MasteryLevel, ProfileSearchResult, StudyStatus } from '@/types'

interface FriendshipRpcRow {
  friendship_id: string
  status: string
  direction: string
  created_at: string
  responded_at: string | null
  other_id: string
  other_nickname: string
  other_icon_type: string
  other_icon_value: string | null
  other_status_message: string | null
}

export function toFriendship(row: FriendshipRpcRow): Friendship {
  return {
    id: row.friendship_id,
    status: row.status as Friendship['status'],
    direction: row.direction as Friendship['direction'],
    createdAt: row.created_at,
    respondedAt: row.responded_at,
    otherId: row.other_id,
    otherNickname: row.other_nickname,
    otherIconType: row.other_icon_type as IconType,
    otherIconValue: row.other_icon_value,
    otherStatusMessage: row.other_status_message,
  }
}

export async function listMyFriendships(): Promise<Friendship[]> {
  const { data, error } = await supabase.rpc('list_my_friendships')
  if (error) {
    throw error
  }
  return ((data ?? []) as FriendshipRpcRow[]).map(toFriendship)
}

interface ProfileSearchRow {
  id: string
  nickname: string
  icon_type: string
  icon_value: string | null
}

export async function searchProfiles(query: string): Promise<ProfileSearchResult[]> {
  const { data, error } = await supabase.rpc('search_profiles', { query })
  if (error) {
    throw error
  }
  return ((data ?? []) as ProfileSearchRow[]).map((row) => ({
    id: row.id,
    nickname: row.nickname,
    iconType: row.icon_type as IconType,
    iconValue: row.icon_value,
  }))
}

export async function sendFriendRequest(myId: string, targetId: string): Promise<void> {
  const { error } = await supabase.from('friendships').insert({ requester_id: myId, recipient_id: targetId })
  if (error) {
    throw error
  }
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted', responded_at: new Date().toISOString() })
    .eq('id', friendshipId)
  if (error) {
    throw error
  }
}

/** 拒否・キャンセル・フレンド解除はいずれも同じ行削除 */
export async function removeFriendship(friendshipId: string): Promise<void> {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
  if (error) {
    throw error
  }
}

interface FriendDashboardRpcResult {
  is_public: boolean
  tanchous?: {
    name: string
    last_studied_at: string | null
    words: { mastery_level: MasteryLevel; flashcard_status: StudyStatus; quiz_status: StudyStatus }[]
  }[]
  snapshots?: MasterySnapshotRow[]
}

export function toFriendDashboard(result: FriendDashboardRpcResult): FriendDashboard {
  if (!result.is_public) {
    return { isPublic: false }
  }
  return {
    isPublic: true,
    tanchous: (result.tanchous ?? []).map((t) => ({
      name: t.name,
      lastStudiedAt: t.last_studied_at,
      words: t.words.map((w) => ({
        masteryLevel: w.mastery_level,
        flashcardStatus: w.flashcard_status,
        quizStatus: w.quiz_status,
      })),
    })),
    snapshots: (result.snapshots ?? []).map(toMasterySnapshot),
  }
}

/** フレンド（承認済み）のダッシュボード用データを取得する。フレンドでない相手を指定するとエラー */
export async function getFriendDashboard(friendId: string): Promise<FriendDashboard> {
  const { data, error } = await supabase.rpc('get_friend_dashboard', { friend_id: friendId })
  if (error) {
    throw error
  }
  return toFriendDashboard(data as FriendDashboardRpcResult)
}
