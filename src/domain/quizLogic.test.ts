import { describe, expect, it } from 'vitest'
import { evaluateQuizAnswer, generateChoices, getQuizAnswerText, getQuizPrompt, pickQuizDirection } from './quizLogic'
import type { Word } from '@/types'

function makeWord(id: string, word: string, meaning: string): Word {
  return {
    id,
    tanchouId: 'tanchou-1',
    word,
    meaning,
    note: '',
    masteryLevel: 'not_memorized',
    flashcardStatus: 'not_shown',
    quizStatus: 'not_shown',
    isStarred: false,
    sortOrder: 0,
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
    const meanings = choices.map((c) => c.text)
    expect(new Set(meanings).size).toBe(meanings.length)
  })

  it('excludes words that happen to share the correct meaning', () => {
    const duplicateMeaningWords = [...words, makeWord('6', 'red apple', 'りんご')]
    const choices = generateChoices(words[0], duplicateMeaningWords)
    expect(choices.filter((c) => c.text === 'りんご')).toHaveLength(1)
  })
})

describe('evaluateQuizAnswer', () => {
  it('returns true only for the correct choice', () => {
    expect(evaluateQuizAnswer({ word: makeWord('1', 'a', 'b'), text: 'b', isCorrect: true })).toBe(true)
    expect(evaluateQuizAnswer({ word: makeWord('1', 'a', 'b'), text: 'b', isCorrect: false })).toBe(false)
  })
})

describe('generateChoices (meaning_to_word)', () => {
  const words = [
    makeWord('1', 'big', '大きい'),
    makeWord('2', 'large', '大きい'),
    makeWord('3', 'small', '小さい'),
    makeWord('4', 'tall', '背が高い'),
    makeWord('5', 'short', '短い'),
    makeWord('6', 'short', '背が低い'),
  ]

  it('shows words as choices with the correct word present exactly once', () => {
    const choices = generateChoices(words[0], words, 'meaning_to_word')
    expect(choices).toHaveLength(4)
    expect(choices.filter((c) => c.isCorrect).map((c) => c.text)).toEqual(['big'])
  })

  it('never offers another word with the same meaning as a wrong choice', () => {
    for (let i = 0; i < 20; i++) {
      const choices = generateChoices(words[0], words, 'meaning_to_word')
      expect(choices.map((c) => c.text)).not.toContain('large')
    }
  })

  it('never shows the same word spelling twice', () => {
    for (let i = 0; i < 20; i++) {
      const texts = generateChoices(words[0], words, 'meaning_to_word').map((c) => c.text)
      expect(new Set(texts).size).toBe(texts.length)
    }
  })
})

describe('pickQuizDirection', () => {
  it('returns the fixed direction as-is', () => {
    expect(pickQuizDirection('word_to_meaning', () => 0.9)).toBe('word_to_meaning')
    expect(pickQuizDirection('meaning_to_word', () => 0.1)).toBe('meaning_to_word')
  })

  it('picks a direction randomly for mix', () => {
    expect(pickQuizDirection('mix', () => 0.1)).toBe('word_to_meaning')
    expect(pickQuizDirection('mix', () => 0.9)).toBe('meaning_to_word')
  })
})

describe('getQuizPrompt / getQuizAnswerText', () => {
  const word = makeWord('1', 'apple', 'りんご')

  it('asks the word and answers the meaning for word_to_meaning', () => {
    expect(getQuizPrompt(word, 'word_to_meaning')).toBe('apple')
    expect(getQuizAnswerText(word, 'word_to_meaning')).toBe('りんご')
  })

  it('asks the meaning and answers the word for meaning_to_word', () => {
    expect(getQuizPrompt(word, 'meaning_to_word')).toBe('りんご')
    expect(getQuizAnswerText(word, 'meaning_to_word')).toBe('apple')
  })
})
