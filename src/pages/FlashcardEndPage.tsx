import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { BottomActionBar } from '@/components/session/BottomActionBar'
import { StarButton } from '@/components/session/StarButton'
import { MASTERY_LEVEL_ICONS } from '@/domain/labels'
import { buildSessionQueue } from '@/domain/sessionQueue'
import type { FilterSnapshot } from '@/domain/sessionQueue'
import { listWords, updateWord } from '@/repositories/wordRepository'
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

  async function handleToggleStar(word: Word) {
    const next = !word.isStarred
    setSessionWords((prev) => prev && prev.map((w) => (w.id === word.id ? { ...w, isStarred: next } : w)))
    await updateWord(word.id, { isStarred: next })
  }

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

      <ul className={styles.list}>
        {sessionWords.map((w) => (
          <li key={w.id} className={styles.listItem}>
            <span className={styles.wordGroup}>
              <span className={styles.wordText}>{w.word}</span>
              <span className={styles.meaningText}>{w.meaning}</span>
              <StarButton isStarred={w.isStarred} onToggle={() => handleToggleStar(w)} />
            </span>
            <span className={styles.levelIcon}>{MASTERY_LEVEL_ICONS[w.masteryLevel]}</span>
          </li>
        ))}
      </ul>

      <BottomActionBar>
        <Button onClick={handleRestart}>もう一度学習する</Button>
        <Button variant="secondary" onClick={() => navigate(routes.submenu(tanchouId))}>
          単語帳に戻る
        </Button>
      </BottomActionBar>
    </div>
  )
}
