import { notifyDataChanged } from './events'
import { readStorage, writeStorage } from './storage'
import type { MasteryLevel, NewWordInput, StudyStatus, Word } from '@/types'

const KEY = 'words'

function readAll(): Word[] {
  return readStorage<Word[]>(KEY) ?? []
}

function writeAll(words: Word[]): void {
  writeStorage(KEY, words)
}

function createWordRecord(tanchouId: string, input: NewWordInput): Word {
  return {
    id: crypto.randomUUID(),
    tanchouId,
    word: input.word,
    meaning: input.meaning,
    note: input.note?.trim() ?? '',
    masteryLevel: 'not_memorized',
    flashcardStatus: 'not_shown',
    quizStatus: 'not_shown',
    isStarred: false,
    createdAt: new Date().toISOString(),
  }
}

export async function listWords(tanchouId: string): Promise<Word[]> {
  return readAll()
    .filter((w) => w.tanchouId === tanchouId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function getWord(id: string): Promise<Word | null> {
  return readAll().find((w) => w.id === id) ?? null
}

export async function createWord(tanchouId: string, input: NewWordInput): Promise<Word> {
  const word = createWordRecord(tanchouId, input)
  writeAll([...readAll(), word])
  notifyDataChanged()
  return word
}

export interface WordUpdate {
  word?: string
  meaning?: string
  note?: string
  masteryLevel?: MasteryLevel
  flashcardStatus?: StudyStatus
  quizStatus?: StudyStatus
  isStarred?: boolean
}

export async function updateWord(id: string, patch: WordUpdate): Promise<Word> {
  const all = readAll()
  const target = all.find((w) => w.id === id)
  if (!target) {
    throw new Error('単語が見つかりません')
  }
  const updated: Word = { ...target, ...patch }
  writeAll(all.map((w) => (w.id === id ? updated : w)))
  return updated
}

export async function deleteWord(id: string): Promise<void> {
  writeAll(readAll().filter((w) => w.id !== id))
  notifyDataChanged()
}

export async function deleteWordsByTanchou(tanchouId: string): Promise<void> {
  writeAll(readAll().filter((w) => w.tanchouId !== tanchouId))
}

export interface BulkImportPlan {
  creates: NewWordInput[]
  updates: { id: string; meaning: string; note: string }[]
}

export async function bulkImportWords(tanchouId: string, plan: BulkImportPlan): Promise<void> {
  const all = readAll()
  const updated = all.map((w) => {
    const match = plan.updates.find((u) => u.id === w.id)
    return match ? { ...w, meaning: match.meaning, note: match.note } : w
  })
  const created = plan.creates.map((input) => createWordRecord(tanchouId, input))
  writeAll([...updated, ...created])
  notifyDataChanged()
}
