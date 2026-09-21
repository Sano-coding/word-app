import { describe, expect, it } from 'vitest'
import { evaluateQuizAnswer, generateChoices } from './quizLogic'
import type { Word } from '@/types'

function makeWord(id: string, word: string, meaning: string): Word {
  return {
    id,
    tanchouId: 'tanchou-1',
    word,
    meaning,
    masteryLevel: 'not_memorized',
    flashcardStatus: 'not_shown',
    quizStatus: 'not_shown',
    createdAt: new Date().toISOString(),
  }
}

describe('generateChoices', () => {
  const words = [
    makeWord('1', 'apple', 'りんご'),
    makeWord('2', 'banana', 'バナナ'),
    makeWord('3', 'cherry', 'さくらんぼ'),
    makeWord('4', 'grape', 'ぶどう'),
    makeWord('5', 'melon', 'メロン'),
  ]

  it('returns exactly 4 choices with the correct answer present exactly once', () => {
    const correctWord = words[0]
    const choices = generateChoices(correctWord, words)
    expect(choices).toHaveLength(4)
    expect(choices.filter((c) => c.isCorrect)).toHaveLength(1)
    expect(choices.find((c) => c.isCorrect)?.word.id).toBe(correctWord.id)
  })

  it('never includes duplicate meanings among the choices', () => {
    const correctWord = words[0]
    const choices = generateChoices(correctWord, words)
    const meanings = choices.map((c) => c.meaning)
    expect(new Set(meanings).size).toBe(meanings.length)
  })

  it('excludes words that happen to share the correct meaning', () => {
    const duplicateMeaningWords = [...words, makeWord('6', 'red apple', 'りんご')]
    const choices = generateChoices(words[0], duplicateMeaningWords)
    expect(choices.filter((c) => c.meaning === 'りんご')).toHaveLength(1)
  })
})

describe('evaluateQuizAnswer', () => {
  it('returns true only for the correct choice', () => {
    expect(evaluateQuizAnswer({ word: makeWord('1', 'a', 'b'), meaning: 'b', isCorrect: true })).toBe(true)
    expect(evaluateQuizAnswer({ word: makeWord('1', 'a', 'b'), meaning: 'b', isCorrect: false })).toBe(false)
  })
})
