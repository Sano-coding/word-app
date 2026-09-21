import { DEFAULT_TANCHOU_NAME, DEFAULT_TANCHOU_WORDS } from '@/domain/seedData'
import { notifyDataChanged } from './events'
import { readStorage, writeStorage } from './storage'
import { bulkImportWords, deleteWordsByTanchou } from './wordRepository'
import type { Tanchou } from '@/types'

const KEY = 'tanchous'

function readAll(): Tanchou[] {
  return readStorage<Tanchou[]>(KEY) ?? []
}

function writeAll(tanchous: Tanchou[]): void {
  writeStorage(KEY, tanchous)
}

export async function listTanchous(accountId: string): Promise<Tanchou[]> {
  return readAll()
    .filter((t) => t.accountId === accountId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function getTanchou(id: string): Promise<Tanchou | null> {
  return readAll().find((t) => t.id === id) ?? null
}

export async function createTanchou(accountId: string, name: string): Promise<Tanchou> {
  const tanchou: Tanchou = {
    id: crypto.randomUUID(),
    accountId,
    name,
    isStarred: false,
    createdAt: new Date().toISOString(),
    visibility: 'private',
  }
  writeAll([...readAll(), tanchou])
  notifyDataChanged()
  return tanchou
}

export async function renameTanchou(id: string, name: string): Promise<Tanchou> {
  const all = readAll()
  const target = all.find((t) => t.id === id)
  if (!target) {
    throw new Error('単語帳が見つかりません')
  }
  const updated: Tanchou = { ...target, name }
  writeAll(all.map((t) => (t.id === id ? updated : t)))
  return updated
}

export async function setTanchouStarred(id: string, isStarred: boolean): Promise<Tanchou> {
  const all = readAll()
  const target = all.find((t) => t.id === id)
  if (!target) {
    throw new Error('単語帳が見つかりません')
  }
  const updated: Tanchou = { ...target, isStarred }
  writeAll(all.map((t) => (t.id === id ? updated : t)))
  return updated
}

/** 新規アカウント作成時に、お試し・チュートリアル用の単語帳を自動生成する */
export async function seedDefaultTanchou(accountId: string): Promise<void> {
  const tanchou = await createTanchou(accountId, DEFAULT_TANCHOU_NAME)
  await bulkImportWords(tanchou.id, { creates: DEFAULT_TANCHOU_WORDS, updates: [] })
}

export async function deleteTanchou(id: string): Promise<void> {
  writeAll(readAll().filter((t) => t.id !== id))
  await deleteWordsByTanchou(id)
  notifyDataChanged()
}
