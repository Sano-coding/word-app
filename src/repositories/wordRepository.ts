import { supabase } from '@/lib/supabaseClient'
import { notifyDataChanged } from './events'
import type { MasteryLevel, NewWordInput, StudyStatus, Word } from '@/types'

interface WordRow {
  id: string
  tanchou_id: string
  word: string
  meaning: string
  note: string
  mastery_level: MasteryLevel
  flashcard_status: StudyStatus
  quiz_status: StudyStatus
  is_starred: boolean
  created_at: string
}

export function toWord(row: WordRow): Word {
  return {
    id: row.id,
    tanchouId: row.tanchou_id,
    word: row.word,
    meaning: row.meaning,
    note: row.note,
    masteryLevel: row.mastery_level,
    flashcardStatus: row.flashcard_status,
    quizStatus: row.quiz_status,
    isStarred: row.is_starred,
    createdAt: row.created_at,
  }
}

export async function listWords(tanchouId: string): Promise<Word[]> {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('tanchou_id', tanchouId)
    .order('created_at', { ascending: true })
  if (error) {
    throw error
  }
  return (data ?? []).map(toWord)
}

export async function getWord(id: string): Promise<Word | null> {
  const { data, error } = await supabase.from('words').select('*').eq('id', id).maybeSingle()
  if (error) {
    throw error
  }
  return data ? toWord(data) : null
}

export async function createWord(tanchouId: string, input: NewWordInput): Promise<Word> {
  const { data, error } = await supabase
    .from('words')
    .insert({
      tanchou_id: tanchouId,
      word: input.word,
      meaning: input.meaning,
      note: input.note?.trim() ?? '',
    })
    .select()
    .single()
  if (error) {
    throw error
  }
  notifyDataChanged()
  return toWord(data)
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

export function toWordRowPatch(patch: WordUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (patch.word !== undefined) row.word = patch.word
  if (patch.meaning !== undefined) row.meaning = patch.meaning
  if (patch.note !== undefined) row.note = patch.note
  if (patch.masteryLevel !== undefined) row.mastery_level = patch.masteryLevel
  if (patch.flashcardStatus !== undefined) row.flashcard_status = patch.flashcardStatus
  if (patch.quizStatus !== undefined) row.quiz_status = patch.quizStatus
  if (patch.isStarred !== undefined) row.is_starred = patch.isStarred
  return row
}

export async function updateWord(id: string, patch: WordUpdate): Promise<Word> {
  const { data, error } = await supabase.from('words').update(toWordRowPatch(patch)).eq('id', id).select().single()
  if (error) {
    throw error
  }
  return toWord(data)
}

export async function deleteWord(id: string): Promise<void> {
  const { error } = await supabase.from('words').delete().eq('id', id)
  if (error) {
    throw error
  }
  notifyDataChanged()
}

export async function deleteWordsByTanchou(tanchouId: string): Promise<void> {
  const { error } = await supabase.from('words').delete().eq('tanchou_id', tanchouId)
  if (error) {
    throw error
  }
}

export interface BulkImportPlan {
  creates: NewWordInput[]
  updates: { id: string; meaning: string; note: string }[]
}

export async function bulkImportWords(tanchouId: string, plan: BulkImportPlan): Promise<void> {
  if (plan.updates.length > 0) {
    const results = await Promise.all(
      plan.updates.map((u) => supabase.from('words').update({ meaning: u.meaning, note: u.note }).eq('id', u.id)),
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      throw failed.error
    }
  }
  if (plan.creates.length > 0) {
    const rows = plan.creates.map((input) => ({
      tanchou_id: tanchouId,
      word: input.word,
      meaning: input.meaning,
      note: input.note?.trim() ?? '',
    }))
    const { error } = await supabase.from('words').insert(rows)
    if (error) {
      throw error
    }
  }
  notifyDataChanged()
}
