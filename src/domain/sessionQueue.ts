import type { MasteryLevel, StudyStatus, Word } from '@/types'

export type SessionOrder = 'registration' | 'random'

export interface SessionFilter {
  masteryLevels: MasteryLevel[]
  statuses: StudyStatus[]
  starredOnly: boolean
}

export interface FilterSnapshot {
  filter: SessionFilter
  order: SessionOrder
  count: number
}

/** masteryLevels / statuses が空配列の場合はその軸で絞り込みなし（全件マッチ）として扱う */
export function filterWords(
  words: Word[],
  filter: SessionFilter,
  statusField: 'flashcardStatus' | 'quizStatus',
): Word[] {
  return words.filter((w) => {
    const matchesMastery = filter.masteryLevels.length === 0 || filter.masteryLevels.includes(w.masteryLevel)
    const matchesStatus = filter.statuses.length === 0 || filter.statuses.includes(w[statusField])
    const matchesStarred = !filter.starredOnly || w.isStarred
    return matchesMastery && matchesStatus && matchesStarred
  })
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function orderWords(words: Word[], order: SessionOrder): Word[] {
  if (order === 'random') return shuffle(words)
  return [...words].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function buildSessionQueue(
  words: Word[],
  filter: SessionFilter,
  statusField: 'flashcardStatus' | 'quizStatus',
  order: SessionOrder,
  count: number,
): Word[] {
  const filtered = filterWords(words, filter, statusField)
  const ordered = orderWords(filtered, order)
  return ordered.slice(0, count)
}
