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

export const STARRED_ICON = '⭐'

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  not_shown: '未出題',
  shown: '出題済',
}

export const STUDY_STATUSES: StudyStatus[] = ['not_shown', 'shown']
