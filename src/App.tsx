import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AccountProvider, useAccount } from '@/context/AccountContext'
import { AppLayout } from '@/components/layout/AppLayout'
import AccountCreatePage from '@/pages/AccountCreatePage'
import AccountSettingsPage from '@/pages/AccountSettingsPage'
import FlashcardEndPage from '@/pages/FlashcardEndPage'
import FlashcardSessionPage from '@/pages/FlashcardSessionPage'
import HomePage from '@/pages/HomePage'
import PreSessionFilterPage from '@/pages/PreSessionFilterPage'
import QuizSessionPage from '@/pages/QuizSessionPage'
import QuizSummaryPage from '@/pages/QuizSummaryPage'
import SubmenuPage from '@/pages/SubmenuPage'
import TanchouSelectPage from '@/pages/TanchouSelectPage'
import TopPage from '@/pages/TopPage'
import WordListPage from '@/pages/WordListPage'
import { routePatterns, routes } from '@/routes'

function AccountGate({ children }: { children: ReactNode }) {
  const { account, loading } = useAccount()
  const location = useLocation()

  if (loading) return null

  if (!account && location.pathname !== routes.create) {
    return <Navigate to={routes.create} replace />
  }
  if (account && location.pathname === routes.create) {
    return <Navigate to={routes.home} replace />
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

            <Route element={<AppLayout />}>
              <Route path={routes.home} element={<HomePage />} />
              <Route path={routes.top} element={<TopPage />} />
              <Route path={routes.settings} element={<AccountSettingsPage />} />
              <Route path={routePatterns.submenu} element={<SubmenuPage />} />
              <Route path={routePatterns.wordList} element={<WordListPage />} />
              <Route path={routePatterns.flashcardFilter} element={<PreSessionFilterPage mode="flashcard" />} />
              <Route path={routePatterns.quizFilter} element={<PreSessionFilterPage mode="quiz" />} />
              <Route path={routes.flashcardHub} element={<TanchouSelectPage mode="flashcard" />} />
              <Route path={routes.quizHub} element={<TanchouSelectPage mode="quiz" />} />
            </Route>

            <Route path={routePatterns.flashcardSession} element={<FlashcardSessionPage />} />
            <Route path={routePatterns.flashcardEnd} element={<FlashcardEndPage />} />
            <Route path={routePatterns.quizSession} element={<QuizSessionPage />} />
            <Route path={routePatterns.quizSummary} element={<QuizSummaryPage />} />

            <Route path="*" element={<Navigate to={routes.home} replace />} />
          </Routes>
        </AccountGate>
      </AccountProvider>
    </BrowserRouter>
  )
}

export default App
