export const routes = {
  create: '/create',
  top: '/',
  settings: '/settings',
  submenu: (tanchouId: string) => `/tanchou/${tanchouId}`,
  wordList: (tanchouId: string) => `/tanchou/${tanchouId}/words`,
  flashcardFilter: (tanchouId: string) => `/tanchou/${tanchouId}/flashcard`,
  flashcardSession: (tanchouId: string) => `/tanchou/${tanchouId}/flashcard/session`,
  flashcardEnd: (tanchouId: string) => `/tanchou/${tanchouId}/flashcard/end`,
  quizFilter: (tanchouId: string) => `/tanchou/${tanchouId}/quiz`,
  quizSession: (tanchouId: string) => `/tanchou/${tanchouId}/quiz/session`,
  quizSummary: (tanchouId: string) => `/tanchou/${tanchouId}/quiz/summary`,
} as const

export const routePatterns = {
  submenu: '/tanchou/:tanchouId',
  wordList: '/tanchou/:tanchouId/words',
  flashcardFilter: '/tanchou/:tanchouId/flashcard',
  flashcardSession: '/tanchou/:tanchouId/flashcard/session',
  flashcardEnd: '/tanchou/:tanchouId/flashcard/end',
  quizFilter: '/tanchou/:tanchouId/quiz',
  quizSession: '/tanchou/:tanchouId/quiz/session',
  quizSummary: '/tanchou/:tanchouId/quiz/summary',
} as const
