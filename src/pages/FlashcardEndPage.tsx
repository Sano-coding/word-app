import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { buildSessionQueue } from '@/domain/sessionQueue'
import type { FilterSnapshot } from '@/domain/sessionQueue'
import { listWords } from '@/repositories/wordRepository'
import { routes } from '@/routes'
import type { Word } from '@/types'
import styles from './FlashcardEndPage.module.css'

interface EndState {
  wordIds: string[]
  filterSnapshot: FilterSnapshot
}

export default function FlashcardEndPage() {
  const { tanchouId } = useParams<{ tanchouId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as EndState | null

  const [sessionWords, setSessionWords] = useState<Word[] | null>(null)

  useEffect(() => {
    if (!tanchouId || !state) return
    listWords(tanchouId).then((all) => {
      setSessionWords(all.filter((w) => state.wordIds.includes(w.id)))
    })
  }, [tanchouId, state])

  useEffect(() => {
    if (!state && tanchouId) {
      navigate(routes.submenu(tanchouId), { replace: true })
    }
  }, [state, tanchouId, navigate])

  if (!tanchouId || !state || !sessionWords) return null

  const memorized = sessionWords.filter((w) => w.masteryLevel === 'memorized').length
  const partially = sessionWords.filter((w) => w.masteryLevel === 'partially_memorized').length
  const notMemorized = sessionWords.filter((w) => w.masteryLevel === 'not_memorized').length

  async function handleRestart() {
    const words = await listWords(tanchouId!)
    const { filter, order, count } = state!.filterSnapshot
    const queue = buildSessionQueue(words, filter, 'flashcardStatus', order, count)
    navigate(routes.flashcardSession(tanchouId!), {
      replace: true,
      state: { queue, filterSnapshot: state!.filterSnapshot },
    })
  }

  return (
    <div className="page">
      <h1 className={styles.title}>フラッシュカード終了</h1>
      <div className={styles.summary}>
        <p>覚えた {memorized}件</p>
        <p>少し覚えた {partially}件</p>
        <p>覚えていない {notMemorized}件</p>
      </div>
      <div className={styles.actions}>
        <Button onClick={handleRestart}>もう一度学習する</Button>
        <Button variant="secondary" onClick={() => navigate(routes.submenu(tanchouId))}>
          単語帳に戻る
        </Button>
      </div>
    </div>
  )
}
