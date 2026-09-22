import { supabase } from '@/lib/supabaseClient'
import type { Account, IconType } from '@/types'

interface ProfileRow {
  id: string
  nickname: string
  icon_type: IconType
  icon_value: string | null
  created_at: string
}

export function toAccount(row: ProfileRow): Account {
  return {
    id: row.id,
    nickname: row.nickname,
    iconType: row.icon_type,
    iconValue: row.icon_value,
    createdAt: row.created_at,
  }
}

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return null
  }
  return data.user.id
}

export async function getAccount(): Promise<Account | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return null
  }
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) {
    throw error
  }
  return data ? toAccount(data) : null
}

export interface CreateAccountInput {
  nickname: string
  iconType: IconType
  iconValue: string | null
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('ログインしていません')
  }
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      nickname: input.nickname,
      icon_type: input.iconType,
      icon_value: input.iconValue,
    })
    .select()
    .single()
  if (error) {
    throw error
  }
  return toAccount(data)
}

export interface UpdateAccountInput {
  nickname: string
  iconType: IconType
  iconValue: string | null
}

export async function updateAccount(input: UpdateAccountInput): Promise<Account> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('ログインしていません')
  }
  const { data, error } = await supabase
    .from('profiles')
    .update({
      nickname: input.nickname,
      icon_type: input.iconType,
      icon_value: input.iconValue,
    })
    .eq('id', userId)
    .select()
    .single()
  if (error) {
    throw error
  }
  return toAccount(data)
}
