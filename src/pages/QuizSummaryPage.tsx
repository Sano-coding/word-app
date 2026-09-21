import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { buildSessionQueue } from '@/domain/sessionQueue'
import type { FilterSnapshot } from '@/domain/sessionQueue'
import { listWords } from '@/repositories/wordRepository'
import { routes } from '@/routes'
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

  useEffect(() => {
    if (!state && tanchouId) {
      navigate(routes.submenu(tanchouId), { replace: true })
    }
  }, [state, tanchouId, navigate])

  if (!tanchouId || !state) return null

  const { answerLog } = state
  const correctCount = answerLog.filter((a) => a.correct).length
  const total = answerLog.length
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0

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
            <span>{a.correct ? '正解' : `不正解（正解：${a.correctMeaning}）`}</span>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <Button onClick={handleRestart}>もう一度学習する</Button>
        <Button variant="secondary" onClick={() => navigate(routes.submenu(tanchouId))}>
          単語帳に戻る
        </Button>
      </div>
    </div>
  )
}
