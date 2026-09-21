import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { FilterControls } from '@/components/session/FilterControls'
import { buildSessionQueue, filterWords } from '@/domain/sessionQueue'
import type { FilterSnapshot, SessionOrder } from '@/domain/sessionQueue'
import { listWords } from '@/repositories/wordRepository'
import { routes } from '@/routes'
import type { MasteryLevel, StudyStatus, Word } from '@/types'
import styles from './PreSessionFilterPage.module.css'

interface PreSessionFilterPageProps {
  mode: 'flashcard' | 'quiz'
}

export default function PreSessionFilterPage({ mode }: PreSessionFilterPageProps) {
  const { tanchouId } = useParams<{ tanchouId: string }>()
  const navigate = useNavigate()
  const [words, setWords] = useState<Word[]>([])
  const [masteryLevels, setMasteryLevels] = useState<MasteryLevel[]>([])
  const [statuses, setStatuses] = useState<StudyStatus[]>([])
  const [order, setOrder] = useState<SessionOrder>('registration')
  const [count, setCount] = useState(10)

  const statusField = mode === 'flashcard' ? 'flashcardStatus' : 'quizStatus'

  useEffect(() => {
    if (!tanchouId) return
    listWords(tanchouId).then(setWords)
  }, [tanchouId])

  const filteredCount = useMemo(
    () => filterWords(words, { masteryLevels, statuses }, statusField).length,
    [words, masteryLevels, statuses, statusField],
  )

  if (!tanchouId) return null

  function handleStart() {
    const filterSnapshot: FilterSnapshot = { filter: { masteryLevels, statuses }, order, count }
    const queue = buildSessionQueue(words, filterSnapshot.filter, statusField, order, count)
    if (mode === 'flashcard') {
      navigate(routes.flashcardSession(tanchouId!), { state: { queue, filterSnapshot } })
    } else {
      navigate(routes.quizSession(tanchouId!), { state: { queue, filterSnapshot } })
    }
  }

  return (
    <div className="page">
      <Button variant="secondary" onClick={() => navigate(routes.submenu(tanchouId))}>
        ← サブメニューへ
      </Button>
      <h1 className={styles.title}>{mode === 'flashcard' ? 'フラッシュカード' : '4択クイズ'}の設定</h1>

      <FilterControls
        statusLabel={mode === 'flashcard' ? 'フラッシュカード出題状況' : '4択クイズ出題状況'}
        masteryLevels={masteryLevels}
        onMasteryLevelsChange={setMasteryLevels}
        statuses={statuses}
        onStatusesChange={setStatuses}
      />

      <div className={styles.row}>
        <span className={styles.label}>出題順</span>
        <label className={styles.radioOption}>
          <input type="radio" checked={order === 'registration'} onChange={() => setOrder('registration')} />
          登録順
        </label>
        <label className={styles.radioOption}>
          <input type="radio" checked={order === 'random'} onChange={() => setOrder('random')} />
          ランダム
        </label>
      </div>

      <label className={styles.row}>
        <span className={styles.label}>出題数</span>
        <input
          type="number"
          min={1}
          value={count}
          onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
          className={styles.numberInput}
        />
      </label>

      <p className={styles.count}>
        対象単語：{filteredCount}個
        {count > filteredCount && filteredCount > 0 && (
          <span className={styles.hint}>（対象単語数に達した時点でセッションが終了します）</span>
        )}
      </p>

      {filteredCount === 0 && <p className={styles.hint}>対象となる単語がありません。絞り込み条件を見直してください。</p>}

      <Button onClick={handleStart} disabled={filteredCount === 0}>
        開始する
      </Button>
    </div>
  )
}
