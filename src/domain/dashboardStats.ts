import type { MasterySnapshot, MasteryLevel, Tanchou, Word } from '@/types'

export type MasteryCounts = Record<MasteryLevel, number>

export function countWordsByMastery(words: Word[]): MasteryCounts {
  const counts: MasteryCounts = { not_memorized: 0, partially_memorized: 0, memorized: 0 }
  for (const word of words) {
    counts[word.masteryLevel] += 1
  }
  return counts
}

export interface StudyStatusCounts {
  shown: number
  notShown: number
}

export function countWordsByStudyStatus(words: Word[], key: 'flashcardStatus' | 'quizStatus'): StudyStatusCounts {
  let shown = 0
  let notShown = 0
  for (const word of words) {
    if (word[key] === 'shown') shown += 1
    else notShown += 1
  }
  return { shown, notShown }
}

export interface TanchouActivity {
  tanchou: Tanchou
  shownCount: number
}

/**
 * 単語帳ごとの「出題済み単語数」（フラッシュカード＋4択クイズの合計）が最も多いものを返す。
 * 1件も出題されていない場合はnull。
 */
export function findMostActiveTanchou(tanchous: Tanchou[], wordsByTanchou: Word[][]): TanchouActivity | null {
  let best: TanchouActivity | null = null
  tanchous.forEach((tanchou, i) => {
    const words = wordsByTanchou[i] ?? []
    const shownCount = words.filter((w) => w.flashcardStatus === 'shown').length + words.filter((w) => w.quizStatus === 'shown').length
    if (shownCount > 0 && (!best || shownCount > best.shownCount)) {
      best = { tanchou, shownCount }
    }
  })
  return best
}

/** `lastStudiedAt` が最も新しい単語帳を返す。1件も学習記録が無い場合はnull。 */
export function findMostRecentlyStudiedTanchou(tanchous: Tanchou[]): Tanchou | null {
  const studied = tanchous.filter((t): t is Tanchou & { lastStudiedAt: string } => t.lastStudiedAt !== null)
  if (studied.length === 0) return null
  return studied.reduce((latest, t) => (t.lastStudiedAt > latest.lastStudiedAt ? t : latest))
}

/** UTC ISO日時文字列を日本時間の「M/D」形式に変換する */
export function formatJstMonthDay(isoDateTime: string): string {
  const jst = new Date(new Date(isoDateTime).getTime() + 9 * 60 * 60 * 1000)
  return `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}`
}

/** 日本時間（UTC+9固定、DSTなし）での今日の日付を YYYY-MM-DD で返す */
export function getTodayJstDateString(now: Date = new Date()): string {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().slice(0, 10)
}

/**
 * スナップショット履歴（日付昇順）に、今日時点の最新集計を1件追加する。
 * 既に今日の行が履歴に含まれる場合（本日中に単語の操作があり、DBトリガーで記録済み）は
 * その行を最新の集計値で上書きし、履歴とダッシュボードの表示を一致させる。
 */
export function mergeTodaySnapshot(
  history: MasterySnapshot[],
  today: string,
  current: MasteryCounts,
): MasterySnapshot[] {
  const todaySnapshot: MasterySnapshot = {
    date: today,
    notMemorized: current.not_memorized,
    partiallyMemorized: current.partially_memorized,
    memorized: current.memorized,
  }
  if (history.length > 0 && history[history.length - 1].date === today) {
    return [...history.slice(0, -1), todaySnapshot]
  }
  return [...history, todaySnapshot]
}

export interface NiceYAxis {
  max: number
  step: number
}

/** Heckbertの"nice numbers"アルゴリズム。1/2/5刻みのキリのいい数値に丸める */
function niceNum(range: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(range))
  const fraction = range / 10 ** exponent
  let niceFraction: number
  if (round) {
    if (fraction < 1.5) niceFraction = 1
    else if (fraction < 3) niceFraction = 2
    else if (fraction < 7) niceFraction = 5
    else niceFraction = 10
  } else {
    if (fraction <= 1) niceFraction = 1
    else if (fraction <= 2) niceFraction = 2
    else if (fraction <= 5) niceFraction = 5
    else niceFraction = 10
  }
  return niceFraction * 10 ** exponent
}

/**
 * グラフのY軸目盛りを「キリのいい数字」に丸める（0, step, 2*step... ≈ maxTicks刻みでmaxに到達）。
 * maxValue が 0 以下の場合は最小限の目盛り（0〜5）を返す。
 */
export function computeNiceYAxisMax(maxValue: number, maxTicks = 5): NiceYAxis {
  if (maxValue <= 0) {
    return { max: 5, step: 1.25 }
  }
  const range = niceNum(maxValue, false)
  const step = niceNum(range / (maxTicks - 1), true)
  const max = Math.ceil(maxValue / step) * step
  return { max, step }
}
