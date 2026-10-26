import { shuffle } from './sessionQueue'
import type { Word } from '@/types'

/** 1問ごとの出題の向き。word_to_meaning は単語を見て意味を選ぶ、meaning_to_word は意味を見て単語を選ぶ */
export type QuizDirection = 'word_to_meaning' | 'meaning_to_word'

/** 出題設定で選ぶ形式。mix は1問ごとに向きをランダムに決める */
export type QuizMode = QuizDirection | 'mix'

export const QUIZ_MODES: QuizMode[] = ['word_to_meaning', 'meaning_to_word', 'mix']

export interface QuizChoice {
  word: Word
  /** 選択肢として表示する文字列（word_to_meaning なら意味、meaning_to_word なら単語） */
  text: string
  isCorrect: boolean
}

const CHOICE_COUNT = 4

/** 4択クイズを利用可能にするために単語帳に必要な最低単語数（誤答3つを確保するため） */
export const QUIZ_MIN_WORD_COUNT = 4

/** 出題形式から1問分の向きを決める。mix のときだけ乱数で選ぶ */
export function pickQuizDirection(mode: QuizMode, random: () => number = Math.random): QuizDirection {
  if (mode !== 'mix') return mode
  return random() < 0.5 ? 'word_to_meaning' : 'meaning_to_word'
}

/** 問題として表示する文字列（word_to_meaning なら単語、meaning_to_word なら意味） */
export function getQuizPrompt(word: Word, direction: QuizDirection): string {
  return direction === 'word_to_meaning' ? word.word : word.meaning
}

/** 選択肢・正解として表示する文字列（問題文の反対側） */
export function getQuizAnswerText(word: Word, direction: QuizDirection): string {
  return direction === 'word_to_meaning' ? word.meaning : word.word
}

/**
 * 正解1つ＋同一単語帳内の他単語から抽出した誤答(最大3つ)をシャッフルして返す。
 * 正解と同じ意味を持つ単語は、どちらの向きでも誤答にしない（word_to_meaning では同じ意味の選択肢が
 * 2つ並び、meaning_to_word では正解が2つになってしまうため）。さらに表示する文字列が重複しないようにする。
 * 誤答候補はセッションの出題対象ではなく単語帳内の全単語から選ぶ（サブメニューの4語以上ガードにより
 * 通常は3つ以上の誤答候補が存在する）。
 */
export function generateChoices(
  correctWord: Word,
  allWordsInTanchou: Word[],
  direction: QuizDirection = 'word_to_meaning',
): QuizChoice[] {
  const correctText = getQuizAnswerText(correctWord, direction)
  const uniqueWrongChoices = new Map<string, Word>()
  for (const w of allWordsInTanchou) {
    if (w.id === correctWord.id || w.meaning === correctWord.meaning) continue
    const text = getQuizAnswerText(w, direction)
    if (text === correctText) continue
    if (!uniqueWrongChoices.has(text)) uniqueWrongChoices.set(text, w)
  }

  const wrongChoices = shuffle([...uniqueWrongChoices.values()]).slice(0, CHOICE_COUNT - 1)

  const choices: QuizChoice[] = [
    { word: correctWord, text: correctText, isCorrect: true },
    ...wrongChoices.map((w) => ({ word: w, text: getQuizAnswerText(w, direction), isCorrect: false })),
  ]

  return shuffle(choices)
}

export function evaluateQuizAnswer(choice: QuizChoice): boolean {
  return choice.isCorrect
}
