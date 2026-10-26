import { QUIZ_MODES } from '@/domain/quizLogic'
import type { QuizMode } from '@/domain/quizLogic'
import { readStorage, writeStorage } from './storage'

const QUIZ_MODE_KEY = 'quizMode'
const DEFAULT_QUIZ_MODE: QuizMode = 'word_to_meaning'

/**
 * 前回選んだ4択クイズの出題形式を返す（このブラウザ内だけの記憶）。
 * 未保存・不正な値・ストレージが使えない環境（プライベートブラウズ等）では初期値を返す。
 */
export function loadQuizMode(): QuizMode {
  try {
    const saved = readStorage<string>(QUIZ_MODE_KEY)
    return QUIZ_MODES.find((mode) => mode === saved) ?? DEFAULT_QUIZ_MODE
  } catch {
    return DEFAULT_QUIZ_MODE
  }
}

/** 出題形式を記憶する。保存できなくてもクイズ自体は続けられるため、失敗は無視する */
export function saveQuizMode(mode: QuizMode): void {
  try {
    writeStorage(QUIZ_MODE_KEY, mode)
  } catch {
    // 記憶できないだけなので握りつぶす
  }
}
