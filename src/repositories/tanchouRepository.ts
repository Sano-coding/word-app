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
  created_at: string
}

export function toTanchou(row: TanchouRow): Tanchou {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.name,
    isStarred: row.is_starred,
    createdAt: row.created_at,
    visibility: row.visibility as Tanchou['visibility'],
  }
}

export async function listTanchous(accountId: string): Promise<Tanchou[]> {
  const { data, error } = await supabase
    .from('tanchous')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: true })
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

export async function createTanchou(accountId: string, name: string): Promise<Tanchou> {
  const { data, error } = await supabase
    .from('tanchous')
    .insert({ account_id: accountId, name, is_starred: false, visibility: 'private' })
    .select()
    .single()
  if (error) {
    throw error
  }
  notifyDataChanged()
  return toTanchou(data)
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
