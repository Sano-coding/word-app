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

export function writeStorage<T>(key: string, value: T): void {
  window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
}

export function removeStorage(key: string): void {
  window.localStorage.removeItem(STORAGE_PREFIX + key)
}
