import { shuffle } from './sessionQueue'
import type { Word } from '@/types'

export interface QuizChoice {
  word: Word
  meaning: string
  isCorrect: boolean
}

const CHOICE_COUNT = 4

/** 4択クイズを利用可能にするために単語帳に必要な最低単語数（誤答3つを確保するため） */
export const QUIZ_MIN_WORD_COUNT = 4

/**
 * 正解1つ＋同一単語帳内の他単語から意味が重複しないよう抽出した誤答(最大3つ)をシャッフルして返す。
 * 誤答候補はセッションの出題対象ではなく単語帳内の全単語から選ぶ（サブメニューの4語以上ガードにより
 * 常に3つ以上の誤答候補が存在する）。
 */
export function generateChoices(correctWord: Word, allWordsInTanchou: Word[]): QuizChoice[] {
  const uniqueWrongMeanings = new Map<string, Word>()
  for (const w of allWordsInTanchou) {
    if (w.id === correctWord.id || w.meaning === correctWord.meaning) continue
    if (!uniqueWrongMeanings.has(w.meaning)) uniqueWrongMeanings.set(w.meaning, w)
  }

  const wrongChoices = shuffle([...uniqueWrongMeanings.values()]).slice(0, CHOICE_COUNT - 1)

  const choices: QuizChoice[] = [
    { word: correctWord, meaning: correctWord.meaning, isCorrect: true },
    ...wrongChoices.map((w) => ({ word: w, meaning: w.meaning, isCorrect: false })),
  ]

  return shuffle(choices)
}

export function evaluateQuizAnswer(choice: QuizChoice): boolean {
  return choice.isCorrect
}
