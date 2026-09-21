import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { ProgressIndicator } from '@/components/session/ProgressIndicator'
import { applyFlashcardLabel } from '@/domain/masteryLevel'
import { MASTERY_LEVELS, MASTERY_LEVEL_LABELS } from '@/domain/labels'
import type { FilterSnapshot } from '@/domain/sessionQueue'
import { updateWord } from '@/repositories/wordRepository'
import { routes } from '@/routes'
import type { MasteryLevel, Word } from '@/types'
import styles from './FlashcardSessionPage.module.css'

interface SessionState {
  queue: Word[]
  filterSnapshot: FilterSnapshot
}

export default function FlashcardSessionPage() {
  const { tanchouId } = useParams<{ tanchouId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as SessionState | null

  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const hasQueue = !!state && state.queue.length > 0

  useEffect(() => {
    if (!hasQueue && tanchouId) {
      navigate(routes.flashcardFilter(tanchouId), { replace: true })
    }
  }, [hasQueue, tanchouId, navigate])

  if (!tanchouId || !hasQueue) return null

  const { queue, filterSnapshot } = state!
  const currentWord = queue[currentIndex]
  const isLast = currentIndex === queue.length - 1

  function goToEnd() {
    navigate(routes.flashcardEnd(tanchouId!), {
      replace: true,
      state: { wordIds: queue.map((w) => w.id), filterSnapshot },
    })
  }

  async function handleLabelSelect(label: MasteryLevel) {
    await updateWord(currentWord.id, {
      masteryLevel: applyFlashcardLabel(label),
      flashcardStatus: 'shown',
    })
    if (isLast) {
      goToEnd()
    } else {
      setCurrentIndex((i) => i + 1)
      setFlipped(false)
    }
  }

  return (
    <div className="page">
      <div className={styles.headerRow}>
        <ProgressIndicator current={currentIndex + 1} total={queue.length} unit="枚" />
        <Button variant="secondary" onClick={goToEnd}>
          中断する
        </Button>
      </div>

      <button type="button" className={styles.card} onClick={() => setFlipped((f) => !f)}>
        {!flipped ? (
          <span className={styles.word}>{currentWord.word}</span>
        ) : (
          <div className={styles.back}>
            <span className={styles.meaning}>{currentWord.meaning}</span>
            <span className={styles.currentLevel}>現在の定着度：{MASTERY_LEVEL_LABELS[currentWord.masteryLevel]}</span>
          </div>
        )}
      </button>

      {!flipped && <p className={styles.hint}>カードをタップして意味を確認</p>}

      {flipped && (
        <div className={styles.labelButtons}>
          {MASTERY_LEVELS.map((level) => (
            <Button key={level} variant="secondary" onClick={() => handleLabelSelect(level)}>
              {MASTERY_LEVEL_LABELS[level]}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
