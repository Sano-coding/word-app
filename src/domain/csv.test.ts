import { describe, expect, it } from 'vitest'
import { buildImportPlan, dedupePreview, parseCsv, validateRows } from './csv'
import type { Word } from '@/types'

function makeWord(partial: Partial<Word>): Word {
  return {
    id: 'id-1',
    tanchouId: 'tanchou-1',
    word: 'apple',
    meaning: 'りんご',
    masteryLevel: 'not_memorized',
    flashcardStatus: 'not_shown',
    quizStatus: 'not_shown',
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
      ['word', 'meaning', 'extra'],
    ])
    expect(result.valid).toEqual([{ word: 'apple', meaning: 'りんご' }])
    expect(result.errorRows).toHaveLength(2)
  })
})

describe('dedupePreview', () => {
  it('separates new words from ones that already exist, and counts duplicates', () => {
    const existing = [makeWord({ word: 'apple', meaning: 'りんご(旧)' })]
    const result = dedupePreview(
      [
        { word: 'apple', meaning: 'りんご(新)' },
        { word: 'banana', meaning: 'バナナ' },
        { word: 'banana', meaning: 'バナナ2' },
      ],
      existing,
    )
    expect(result.toCreate).toEqual([{ word: 'banana', meaning: 'バナナ2' }])
    expect(result.toUpdate).toEqual([{ id: 'id-1', word: 'apple', meaning: 'りんご(新)' }])
    expect(result.duplicateCount).toBe(2)
  })
})

describe('buildImportPlan', () => {
  const dedupeResult = {
    toCreate: [{ word: 'banana', meaning: 'バナナ' }],
    toUpdate: [{ id: 'id-1', word: 'apple', meaning: 'りんご(新)' }],
    duplicateCount: 1,
  }

  it('keep_existing policy skips updates', () => {
    expect(buildImportPlan(dedupeResult, 'keep_existing')).toEqual({
      creates: dedupeResult.toCreate,
      updates: [],
    })
  })

  it('overwrite policy applies meaning updates', () => {
    expect(buildImportPlan(dedupeResult, 'overwrite')).toEqual({
      creates: dedupeResult.toCreate,
      updates: [{ id: 'id-1', meaning: 'りんご(新)' }],
    })
  })
})
