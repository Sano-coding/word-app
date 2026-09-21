import type { MasteryLevel } from '@/types'

export function applyQuizAnswer(current: MasteryLevel, isCorrect: boolean): MasteryLevel {
  if (!isCorrect) {
    return current === 'memorized' ? 'partially_memorized' : 'not_memorized'
  }
  if (current === 'partially_memorized') return 'memorized'
  if (current === 'memorized') return 'memorized'
  return 'partially_memorized'
}

export function applyFlashcardLabel(selectedLabel: MasteryLevel): MasteryLevel {
  return selectedLabel
}
