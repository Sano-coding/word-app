import { beforeEach, describe, expect, it } from 'vitest'
import { createWord, deleteWord, deleteWordsByTanchou, listWords, updateWord } from './wordRepository'

beforeEach(() => {
  window.localStorage.clear()
})

describe('wordRepository', () => {
  it('creates a word with default attributes', async () => {
    const word = await createWord('tanchou-1', { word: 'apple', meaning: 'りんご' })
    expect(word.masteryLevel).toBe('not_memorized')
    expect(word.flashcardStatus).toBe('not_shown')
    expect(word.quizStatus).toBe('not_shown')
    expect(word.note).toBe('')
  })

  it('creates a word with a note when provided, trimmed', async () => {
    const word = await createWord('tanchou-1', { word: 'apple', meaning: 'りんご', note: '  赤い果物  ' })
    expect(word.note).toBe('赤い果物')
  })

  it('lists only words belonging to the given tanchou, sorted by creation order', async () => {
    await createWord('tanchou-1', { word: 'apple', meaning: 'りんご' })
    await createWord('tanchou-2', { word: 'orange', meaning: 'オレンジ' })
    await createWord('tanchou-1', { word: 'banana', meaning: 'バナナ' })

    const words = await listWords('tanchou-1')
    expect(words.map((w) => w.word)).toEqual(['apple', 'banana'])
  })

  it('updates only the given fields, leaving others untouched', async () => {
    const word = await createWord('tanchou-1', { word: 'apple', meaning: 'りんご' })
    const updated = await updateWord(word.id, { masteryLevel: 'memorized' })
    expect(updated.masteryLevel).toBe('memorized')
    expect(updated.flashcardStatus).toBe('not_shown')
    expect(updated.meaning).toBe('りんご')
  })

  it('deletes a word by id', async () => {
    const word = await createWord('tanchou-1', { word: 'apple', meaning: 'りんご' })
    await deleteWord(word.id)
    expect(await listWords('tanchou-1')).toHaveLength(0)
  })

  it('deletes all words belonging to a tanchou', async () => {
    await createWord('tanchou-1', { word: 'apple', meaning: 'りんご' })
    await createWord('tanchou-1', { word: 'banana', meaning: 'バナナ' })
    await createWord('tanchou-2', { word: 'orange', meaning: 'オレンジ' })

    await deleteWordsByTanchou('tanchou-1')

    expect(await listWords('tanchou-1')).toHaveLength(0)
    expect(await listWords('tanchou-2')).toHaveLength(1)
  })
})
