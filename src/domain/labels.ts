import type { QuizMode } from './quizLogic'
import type { MasteryLevel, StudyStatus } from '@/types'

export const MASTERY_LEVEL_LABELS: Record<MasteryLevel, string> = {
  not_memorized: '覚えていない',
  partially_memorized: '少し覚えた',
  memorized: '覚えた',
}

export const MASTERY_LEVEL_ICONS: Record<MasteryLevel, string> = {
  not_memorized: '😞',
  partially_memorized: '😐',
  memorized: '😀',
}

export const MASTERY_LEVELS: MasteryLevel[] = ['not_memorized', 'partially_memorized', 'memorized']

/**
 * ダッシュボードのグラフ専用の配色（2026-10-11：favorite_color.csvの傾向分析をもとに選定。
 * 削除ボタンやエラー表示で使う danger/warning/success とは独立しているため、
 * そちらを変更してもこの配色には影響しない）
 */
export const MASTERY_LEVEL_COLORS: Record<MasteryLevel, string> = {
  not_memorized: '#cd5c5c',
  partially_memorized: '#ffd700',
  memorized: '#20b2aa',
}

export const STARRED_ICON = '⭐'
export const UNSTARRED_ICON = '☆'

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  not_shown: '未出題',
  shown: '出題済',
}

export const STUDY_STATUS_ICONS: Record<StudyStatus, string> = {
  not_shown: '⬜',
  shown: '✅',
}

export const STUDY_STATUSES: StudyStatus[] = ['not_shown', 'shown']

export const QUIZ_MODE_LABELS: Record<QuizMode, string> = {
  word_to_meaning: '単語 → 意味',
  meaning_to_word: '意味 → 単語',
  mix: 'ミックス',
}

/** 出題形式ボタンのアイコン（「A」が単語、「あ」が意味を表す） */
export const QUIZ_MODE_ICONS: Record<QuizMode, string> = {
  word_to_meaning: 'A→あ',
  meaning_to_word: 'あ→A',
  mix: 'A⇄あ',
}

export const QUIZ_MODE_DESCRIPTIONS: Record<QuizMode, string> = {
  word_to_meaning: '単語を見て、正しい意味を4つから選びます。',
  meaning_to_word: '意味を見て、正しい単語を4つから選びます。',
  mix: '1問ごとに「単語 → 意味」と「意味 → 単語」をランダムに出題します。',
}
