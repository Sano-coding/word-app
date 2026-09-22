import { readStorage } from './storage'
import type { Account, Tanchou, Word } from '@/types'

const MIGRATED_FLAG_KEY = 'word-app:migrated-to-cloud'

export interface LocalBackup {
  account: Account | null
  tanchous: Tanchou[]
  words: Word[]
}

/** 旧localStorage版（Supabase移行前）に保存されていたデータをそのまま読み出す */
export function readLocalBackup(): LocalBackup {
  return {
    account: readStorage<Account>('account'),
    tanchous: readStorage<Tanchou[]>('tanchous') ?? [],
    words: readStorage<Word[]>('words') ?? [],
  }
}

export function hasUnmigratedLocalData(): boolean {
  if (localStorage.getItem(MIGRATED_FLAG_KEY)) {
    return false
  }
  return readLocalBackup().tanchous.length > 0
}

export function markLocalDataMigrated(): void {
  localStorage.setItem(MIGRATED_FLAG_KEY, 'true')
}
