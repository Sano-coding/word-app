import { STARRED_ICON, UNSTARRED_ICON } from '@/domain/labels'
import type { Tanchou } from '@/types'

/** 単語帳一覧でのスター絞り込み条件 */
export type StarFilter = 'all' | 'starred' | 'unstarred'

export const STAR_FILTERS: StarFilter[] = ['all', 'starred', 'unstarred']

export const STAR_FILTER_LABELS: Record<StarFilter, string> = {
  all: 'すべて',
  starred: 'スター付き',
  unstarred: 'スターなし',
}

/** 「すべて」はアイコンなし（スターの有無を問わないため） */
export const STAR_FILTER_ICONS: Record<StarFilter, string | null> = {
  all: null,
  starred: STARRED_ICON,
  unstarred: UNSTARRED_ICON,
}

export const STAR_FILTER_EMPTY_MESSAGES: Record<StarFilter, string> = {
  all: 'まだ単語帳がありません。「+ 新規作成」から作成しましょう。',
  starred: 'スター付きの単語帳がありません。カードの☆を押すとスターを付けられます。',
  unstarred: 'スターなしの単語帳がありません。すべての単語帳にスターが付いています。',
}

export function filterTanchousByStar(tanchous: Tanchou[], filter: StarFilter): Tanchou[] {
  if (filter === 'all') return tanchous
  const wantStarred = filter === 'starred'
  return tanchous.filter((t) => t.isStarred === wantStarred)
}

export function countTanchousByStar(tanchous: Tanchou[]): Record<StarFilter, number> {
  const starred = tanchous.filter((t) => t.isStarred).length
  return {
    all: tanchous.length,
    starred,
    unstarred: tanchous.length - starred,
  }
}
