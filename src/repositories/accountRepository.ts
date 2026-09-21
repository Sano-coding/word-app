import { readStorage, writeStorage } from './storage'
import type { Account, IconType } from '@/types'

const KEY = 'account'

export async function getAccount(): Promise<Account | null> {
  return readStorage<Account>(KEY)
}

export interface CreateAccountInput {
  nickname: string
  iconType: IconType
  iconValue: string | null
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  const account: Account = {
    id: crypto.randomUUID(),
    nickname: input.nickname,
    iconType: input.iconType,
    iconValue: input.iconValue,
    createdAt: new Date().toISOString(),
  }
  writeStorage(KEY, account)
  return account
}

export interface UpdateAccountInput {
  nickname: string
  iconType: IconType
  iconValue: string | null
}

export async function updateAccount(input: UpdateAccountInput): Promise<Account> {
  const existing = await getAccount()
  if (!existing) {
    throw new Error('アカウントが存在しません')
  }
  const updated: Account = {
    ...existing,
    nickname: input.nickname,
    iconType: input.iconType,
    iconValue: input.iconValue,
  }
  writeStorage(KEY, updated)
  return updated
}
