const STORAGE_PREFIX = 'word-app:'

export function readStorage<T>(key: string): T | null {
  const raw = window.localStorage.getItem(STORAGE_PREFIX + key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export class StorageQuotaError extends Error {
  constructor() {
    super('保存容量の上限に達しました。カメラロール画像や単語帳を整理してからもう一度お試しください。')
    this.name = 'StorageQuotaError'
  }
}

export function isQuotaExceededError(err: unknown): boolean {
  return err instanceof DOMException && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch (err) {
    if (isQuotaExceededError(err)) {
      throw new StorageQuotaError()
    }
    throw err
  }
}

export function removeStorage(key: string): void {
  window.localStorage.removeItem(STORAGE_PREFIX + key)
}
