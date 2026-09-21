import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getAccount } from '@/repositories/accountRepository'
import type { Account } from '@/types'

interface AccountContextValue {
  account: Account | null
  loading: boolean
  refreshAccount: () => Promise<void>
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined)

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshAccount = useCallback(async () => {
    const current = await getAccount()
    setAccount(current)
  }, [])

  useEffect(() => {
    setLoading(true)
    refreshAccount().finally(() => setLoading(false))
  }, [refreshAccount])

  return (
    <AccountContext.Provider value={{ account, loading, refreshAccount }}>
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext)
  if (!ctx) {
    throw new Error('useAccount は AccountProvider の内側で使用してください')
  }
  return ctx
}
