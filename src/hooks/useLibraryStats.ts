import { useCallback, useEffect, useState } from 'react'
import { useAccount } from '@/context/AccountContext'
import { subscribeToDataChanges } from '@/repositories/events'
import { listTanchous } from '@/repositories/tanchouRepository'
import { listWords } from '@/repositories/wordRepository'

export interface LibraryStats {
  tanchouCount: number
  wordCount: number
}

export function useLibraryStats(): LibraryStats {
  const { account } = useAccount()
  const [stats, setStats] = useState<LibraryStats>({ tanchouCount: 0, wordCount: 0 })

  const refresh = useCallback(async () => {
    if (!account) return
    const tanchous = await listTanchous(account.id)
    const wordLists = await Promise.all(tanchous.map((t) => listWords(t.id)))
    setStats({
      tanchouCount: tanchous.length,
      wordCount: wordLists.reduce((sum, words) => sum + words.length, 0),
    })
  }, [account])

  useEffect(() => {
    refresh()
    return subscribeToDataChanges(refresh)
  }, [refresh])

  return stats
}
