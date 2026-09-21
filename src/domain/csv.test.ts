import { describe, expect, it } from 'vitest'
import { buildImportPlan, dedupePreview, parseCsv, validateRows } from './csv'
import type { Word } from '@/types'

function makeWord(partial: Partial<Word>): Word {
  return {
    id: 'id-1',
    tanchouId: 'tanchou-1',
    word: 'apple',
    meaning: 'りんご',
    note: '',
    masteryLevel: 'not_memorized',
    flashcardStatus: 'not_shown',
    quizStatus: 'not_shown',
    isStarred: false,
    createdAt: new Date().toISOString(),
    ...partial,
  }
}

describe('parseCsv', () => {
  it('parses a simple comma-separated file with header', () => {
    const rows = parseCsv('単語,意味\napple,りんご\nbanana,バナナ\n')
    expect(rows).toEqual([
      ['単語', '意味'],
      ['apple', 'りんご'],
      ['banana', 'バナナ'],
    ])
  })

  it('handles quoted fields containing commas and escaped quotes', () => {
    const rows = parseCsv('単語,意味\n"a, b","say ""hi"""\n')
    expect(rows).toEqual([
      ['単語', '意味'],
      ['a, b', 'say "hi"'],
    ])
  })

  it('handles CRLF line endings', () => {
    const rows = parseCsv('単語,意味\r\napple,りんご\r\n')
    expect(rows).toEqual([
      ['単語', '意味'],
      ['apple', 'りんご'],
    ])
  })
})

describe('validateRows', () => {
  it('drops the header row and validates remaining rows', () => {
    const result = validateRows([
      ['単語', '意味'],
      ['apple', 'りんご'],
      ['', '意味だけ'],
      ['word', 'meaning', 'extra', 'too-many'],
    ])
    expect(result.valid).toEqual([{ word: 'apple', meaning: 'りんご', note: '' }])
    expect(result.errorRows).toHaveLength(2)
  })

  it('accepts an optional third column as note', () => {
    const result = validateRows([
      ['単語', '意味', '補足'],
      ['apple', 'りんご', '赤い果物'],
      ['banana', 'バナナ', ''],
    ])
    expect(result.valid).toEqual([
      { word: 'apple', meaning: 'りんご', note: '赤い果物' },
      { word: 'banana', meaning: 'バナナ', note: '' },
    ])
    expect(result.errorRows).toHaveLength(0)
  })
})

describe('dedupePreview', () => {
  it('separates new words from ones that already exist, and counts duplicates', () => {
    const existing = [makeWord({ word: 'apple', meaning: 'りんご(旧)' })]
    const result = dedupePreview(
      [
        { word: 'apple', meaning: 'りんご(新)', note: '新しい補足' },
        { word: 'banana', meaning: 'バナナ', note: '' },
        { word: 'banana', meaning: 'バナナ2', note: '' },
      ],
      existing,
    )
    expect(result.toCreate).toEqual([{ word: 'banana', meaning: 'バナナ2', note: '' }])
    expect(result.toUpdate).toEqual([{ id: 'id-1', word: 'apple', meaning: 'りんご(新)', note: '新しい補足' }])
    expect(result.duplicateCount).toBe(2)
  })
})

describe('buildImportPlan', () => {
  const dedupeResult = {
    toCreate: [{ word: 'banana', meaning: 'バナナ', note: '' }],
    toUpdate: [{ id: 'id-1', word: 'apple', meaning: 'りんご(新)', note: '新しい補足' }],
    duplicateCount: 1,
  }

  it('keep_existing policy skips updates', () => {
    expect(buildImportPlan(dedupeResult, 'keep_existing')).toEqual({
      creates: dedupeResult.toCreate,
      updates: [],
    })
  })

  it('overwrite policy applies meaning and note updates', () => {
    expect(buildImportPlan(dedupeResult, 'overwrite')).toEqual({
      creates: dedupeResult.toCreate,
      updates: [{ id: 'id-1', meaning: 'りんご(新)', note: '新しい補足' }],
    })
  })
})
