import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { QUIZ_MIN_WORD_COUNT } from '@/domain/quizLogic'
import { getTanchou } from '@/repositories/tanchouRepository'
import { listWords } from '@/repositories/wordRepository'
import { routes } from '@/routes'
import type { Tanchou, Word } from '@/types'
import styles from './SubmenuPage.module.css'

export default function SubmenuPage() {
  const { tanchouId } = useParams<{ tanchouId: string }>()
  const navigate = useNavigate()
  const [tanchou, setTanchou] = useState<Tanchou | null>(null)
  const [words, setWords] = useState<Word[]>([])

  useEffect(() => {
    if (!tanchouId) return
    getTanchou(tanchouId).then(setTanchou)
    listWords(tanchouId).then(setWords)
  }, [tanchouId])

  if (!tanchouId || !tanchou) return null

  const quizAvailable = words.length >= QUIZ_MIN_WORD_COUNT

  return (
    <div className="page">
      <Button variant="secondary" onClick={() => navigate(routes.top)}>
        ← 戻る
      </Button>
      <h1 className={styles.title}>{tanchou.name}</h1>

      <div className={styles.menu}>
        <button type="button" className={styles.menuItem} onClick={() => navigate(routes.wordList(tanchouId))}>
          <span className={styles.menuIcon}>📋</span>
          単語リスト
        </button>

        <button type="button" className={styles.menuItem} onClick={() => navigate(routes.flashcardFilter(tanchouId))}>
          <span className={styles.menuIcon}>🃏</span>
          フラッシュカード
        </button>

        <button
          type="button"
          className={styles.menuItem}
          disabled={!quizAvailable}
          onClick={() => quizAvailable && navigate(routes.quizFilter(tanchouId))}
        >
          <span className={styles.menuIcon}>❓</span>
          4択クイズ
        </button>
        {!quizAvailable && (
          <p className={styles.hint}>
            4単語以上単語帳に登録することでこの機能は利用できるようになります。たくさん単語を登録しよう！
          </p>
        )}
      </div>
    </div>
  )
}
