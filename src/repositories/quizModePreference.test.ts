import { beforeEach, describe, expect, it } from 'vitest'
import { loadQuizMode, saveQuizMode } from './quizModePreference'

describe('quizModePreference', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('defaults to word_to_meaning when nothing is saved', () => {
    expect(loadQuizMode()).toBe('word_to_meaning')
  })

  it('returns the last saved mode', () => {
    saveQuizMode('mix')
    expect(loadQuizMode()).toBe('mix')
  })

  it('falls back to the default for an unknown saved value', () => {
    window.localStorage.setItem('word-app:quizMode', JSON.stringify('reverse'))
    expect(loadQuizMode()).toBe('word_to_meaning')
  })
})
