import type { NewWordInput, Word } from '@/types'

export interface CsvParseError {
  rowIndex: number
  reason: string
}

/**
 * RFC4180 相当の簡易パーサー。引用符で囲まれたフィールド・エスケープされた引用符（""）・
 * フィールド内の改行やカンマ・CRLF/LF 改行を扱う。「単語,意味」の2列固定フォーマット向けの
 * 簡易実装であり、可変区切り文字や複雑な要件が出てきた場合は papaparse 等への置き換えを検討する。
 */
export function parseCsv(rawText: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const text = rawText.replace(/^﻿/, '')

  function pushField() {
    row.push(field)
    field = ''
  }
  function pushRow() {
    pushField()
    rows.push(row)
    row = []
  }

  while (i < text.length) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += char
      i += 1
      continue
    }

    if (char === '"') {
      inQuotes = true
      i += 1
      continue
    }
    if (char === ',') {
      pushField()
      i += 1
      continue
    }
    if (char === '\r') {
      i += 1
      continue
    }
    if (char === '\n') {
      pushRow()
      i += 1
      continue
    }
    field += char
    i += 1
  }

  if (field.length > 0 || row.length > 0) {
    pushRow()
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

export interface ValidatedRows {
  valid: NewWordInput[]
  errorRows: CsvParseError[]
}

export function validateRows(rows: string[][]): ValidatedRows {
  const [, ...dataRows] = rows
  const valid: NewWordInput[] = []
  const errorRows: CsvParseError[] = []

  dataRows.forEach((cols, index) => {
    const rowIndex = index + 2 // 1-indexed, +1 for header row
    if (cols.length !== 2 && cols.length !== 3) {
      errorRows.push({ rowIndex, reason: '列数が単語・意味（・補足）の形式と一致しません' })
      return
    }
    const [word, meaning, note] = cols
    if (word.trim().length === 0 || meaning.trim().length === 0) {
      errorRows.push({ rowIndex, reason: '単語または意味が空です' })
      return
    }
    valid.push({ word: word.trim(), meaning: meaning.trim(), note: note?.trim() ?? '' })
  })

  return { valid, errorRows }
}

export interface DedupeResult {
  toCreate: NewWordInput[]
  toUpdate: { id: string; word: string; meaning: string; note: string }[]
  duplicateCount: number
}

export function dedupePreview(valid: NewWordInput[], existingWords: Word[]): DedupeResult {
  const dedupedByFile = new Map<string, NewWordInput>()
  let fileDuplicateCount = 0
  for (const entry of valid) {
    if (dedupedByFile.has(entry.word)) fileDuplicateCount += 1
    dedupedByFile.set(entry.word, entry) // 同一単語が複数行ある場合は最後の行を採用
  }

  const toCreate: NewWordInput[] = []
  const toUpdate: { id: string; word: string; meaning: string; note: string }[] = []
  let existingDuplicateCount = 0

  for (const entry of dedupedByFile.values()) {
    const existing = existingWords.find((w) => w.word === entry.word)
    if (existing) {
      existingDuplicateCount += 1
      toUpdate.push({ id: existing.id, word: entry.word, meaning: entry.meaning, note: entry.note ?? '' })
    } else {
      toCreate.push(entry)
    }
  }

  return { toCreate, toUpdate, duplicateCount: fileDuplicateCount + existingDuplicateCount }
}

export type DuplicatePolicy = 'keep_existing' | 'overwrite'

export interface ImportPlan {
  creates: NewWordInput[]
  updates: { id: string; meaning: string; note: string }[]
}

export function buildImportPlan(dedupeResult: DedupeResult, policy: DuplicatePolicy): ImportPlan {
  const updates =
    policy === 'overwrite'
      ? dedupeResult.toUpdate.map((u) => ({ id: u.id, meaning: u.meaning, note: u.note }))
      : []
  return { creates: dedupeResult.toCreate, updates }
}
