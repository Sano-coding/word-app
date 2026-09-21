import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AccountProvider, useAccount } from '@/context/AccountContext'
import AccountCreatePage from '@/pages/AccountCreatePage'
import AccountSettingsPage from '@/pages/AccountSettingsPage'
import PlaceholderPage from '@/pages/PlaceholderPage'
import SubmenuPage from '@/pages/SubmenuPage'
import TopPage from '@/pages/TopPage'
import { routePatterns, routes } from '@/routes'

function AccountGate({ children }: { children: ReactNode }) {
  const { account, loading } = useAccount()
  const location = useLocation()

  if (loading) return null

  if (!account && location.pathname !== routes.create) {
    return <Navigate to={routes.create} replace />
  }
  if (account && location.pathname === routes.create) {
    return <Navigate to={routes.top} replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <AccountProvider>
        <AccountGate>
          <Routes>
            <Route path={routes.create} element={<AccountCreatePage />} />
            <Route path={routes.top} element={<TopPage />} />
            <Route path={routes.settings} element={<AccountSettingsPage />} />
            <Route path={routePatterns.submenu} element={<SubmenuPage />} />
            <Route path={routePatterns.wordList} element={<PlaceholderPage label="単語リスト" />} />
            <Route path={routePatterns.flashcardFilter} element={<PlaceholderPage label="フラッシュカード" />} />
            <Route path={routePatterns.quizFilter} element={<PlaceholderPage label="4択クイズ" />} />
            <Route path="*" element={<Navigate to={routes.top} replace />} />
          </Routes>
        </AccountGate>
      </AccountProvider>
    </BrowserRouter>
  )
}

export default App
