import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { BottomActionBar } from '@/components/session/BottomActionBar'
import { StarButton } from '@/components/session/StarButton'
import { buildSessionQueue } from '@/domain/sessionQueue'
import type { FilterSnapshot } from '@/domain/sessionQueue'
import { listWords, updateWord } from '@/repositories/wordRepository'
import { routes } from '@/routes'
import type { Word } from '@/types'
import type { QuizAnswerLogEntry } from './QuizSessionPage'
import styles from './QuizSummaryPage.module.css'

interface SummaryState {
  answerLog: QuizAnswerLogEntry[]
  wordIds: string[]
  filterSnapshot: FilterSnapshot
}

export default function QuizSummaryPage() {
  const { tanchouId } = useParams<{ tanchouId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as SummaryState | null
  const [wordsById, setWordsById] = useState<Record<string, Word>>({})

  useEffect(() => {
    if (!state && tanchouId) {
      navigate(routes.submenu(tanchouId), { replace: true })
    }
  }, [state, tanchouId, navigate])

  useEffect(() => {
    if (!tanchouId) return
    listWords(tanchouId).then((all) => {
      setWordsById(Object.fromEntries(all.map((w) => [w.id, w])))
    })
  }, [tanchouId])

  if (!tanchouId || !state) return null

  const { answerLog } = state
  const correctCount = answerLog.filter((a) => a.correct).length
  const total = answerLog.length
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0

  async function handleToggleStar(wordId: string) {
    const current = wordsById[wordId]
    if (!current) return
    const next = !current.isStarred
    setWordsById((prev) => ({ ...prev, [wordId]: { ...prev[wordId], isStarred: next } }))
    await updateWord(wordId, { isStarred: next })
  }

  async function handleRestart() {
    const words = await listWords(tanchouId!)
    const { filter, order, count } = state!.filterSnapshot
    const queue = buildSessionQueue(words, filter, 'quizStatus', order, count)
    navigate(routes.quizSession(tanchouId!), {
      replace: true,
      state: { queue, filterSnapshot: state!.filterSnapshot },
    })
  }

  return (
    <div className="page">
      <h1 className={styles.title}>4択クイズ 結果</h1>
      <p className={styles.score}>
        {total}問中{correctCount}問正解（正答率{accuracy}%）
      </p>

      <ul className={styles.list}>
        {answerLog.map((a, i) => (
          <li key={i} className={a.correct ? styles.correctItem : styles.incorrectItem}>
            <span className={styles.wordText}>{a.word}</span>
            <span className={styles.resultGroup}>
              <span>{a.correct ? '正解' : `不正解（正解：${a.correctMeaning}）`}</span>
              <StarButton isStarred={wordsById[a.wordId]?.isStarred ?? false} onToggle={() => handleToggleStar(a.wordId)} />
            </span>
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
