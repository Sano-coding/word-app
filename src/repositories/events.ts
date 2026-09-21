type Listener = () => void

const listeners = new Set<Listener>()

/** 単語帳・単語の件数が変わりうる書き込み操作の後に呼び、購読者へ再取得を促す */
export function notifyDataChanged(): void {
  for (const listener of listeners) listener()
}

export function subscribeToDataChanges(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
