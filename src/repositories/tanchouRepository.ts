import { DEFAULT_TANCHOU_NAME, DEFAULT_TANCHOU_WORDS } from '@/domain/seedData'
import { supabase } from '@/lib/supabaseClient'
import { notifyDataChanged } from './events'
import { bulkImportWords } from './wordRepository'
import type { Tanchou } from '@/types'

interface TanchouRow {
  id: string
  account_id: string
  name: string
  is_starred: boolean
  visibility: string
  sort_order: number
  created_at: string
}

export function toTanchou(row: TanchouRow): Tanchou {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.name,
    isStarred: row.is_starred,
    createdAt: row.created_at,
    sortOrder: row.sort_order,
    visibility: row.visibility as Tanchou['visibility'],
  }
}

export async function listTanchous(accountId: string): Promise<Tanchou[]> {
  const { data, error } = await supabase
    .from('tanchous')
    .select('*')
    .eq('account_id', accountId)
    .order('sort_order', { ascending: true })
  if (error) {
    throw error
  }
  return (data ?? []).map(toTanchou)
}

export async function getTanchou(id: string): Promise<Tanchou | null> {
  const { data, error } = await supabase.from('tanchous').select('*').eq('id', id).maybeSingle()
  if (error) {
    throw error
  }
  return data ? toTanchou(data) : null
}

async function getNextSortOrder(accountId: string): Promise<number> {
  const { data, error } = await supabase
    .from('tanchous')
    .select('sort_order')
    .eq('account_id', accountId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    throw error
  }
  return data ? data.sort_order + 1 : 0
}

export async function createTanchou(accountId: string, name: string): Promise<Tanchou> {
  const sortOrder = await getNextSortOrder(accountId)
  const { data, error } = await supabase
    .from('tanchous')
    .insert({ account_id: accountId, name, is_starred: false, visibility: 'private', sort_order: sortOrder })
    .select()
    .single()
  if (error) {
    throw error
  }
  notifyDataChanged()
  return toTanchou(data)
}

/** ドラッグ操作後の新しい並び順で、渡された順序どおりに sort_order を振り直す */
export async function reorderTanchous(orderedIds: string[]): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, index) => supabase.from('tanchous').update({ sort_order: index }).eq('id', id)),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    throw failed.error
  }
}

export async function renameTanchou(id: string, name: string): Promise<Tanchou> {
  const { data, error } = await supabase.from('tanchous').update({ name }).eq('id', id).select().single()
  if (error) {
    throw error
  }
  return toTanchou(data)
}

export async function setTanchouStarred(id: string, isStarred: boolean): Promise<Tanchou> {
  const { data, error } = await supabase
    .from('tanchous')
    .update({ is_starred: isStarred })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    throw error
  }
  return toTanchou(data)
}

/** 新規アカウント作成時に、お試し・チュートリアル用の単語帳を自動生成する */
export async function seedDefaultTanchou(accountId: string): Promise<void> {
  const tanchou = await createTanchou(accountId, DEFAULT_TANCHOU_NAME)
  await bulkImportWords(tanchou.id, { creates: DEFAULT_TANCHOU_WORDS, updates: [] })
}

export async function deleteTanchou(id: string): Promise<void> {
  const { error } = await supabase.from('tanchous').delete().eq('id', id)
  if (error) {
    throw error
  }
  notifyDataChanged()
}
