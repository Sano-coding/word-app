import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { QUIZ_MIN_WORD_COUNT } from '@/domain/quizLogic'
import { useAccount } from '@/context/AccountContext'
import { listTanchous } from '@/repositories/tanchouRepository'
import { listWords } from '@/repositories/wordRepository'
import { routes } from '@/routes'
import type { Tanchou } from '@/types'
import styles from './TanchouSelectPage.module.css'

interface TanchouSelectPageProps {
  mode: 'flashcard' | 'quiz'
}

export default function TanchouSelectPage({ mode }: TanchouSelectPageProps) {
  const { account } = useAccount()
  const navigate = useNavigate()
  const [tanchous, setTanchous] = useState<Tanchou[]>([])
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({})

  const refresh = useCallback(async () => {
    if (!account) return
    const list = await listTanchous(account.id)
    setTanchous(list)
    const entries = await Promise.all(list.map(async (t) => [t.id, (await listWords(t.id)).length] as const))
    setWordCounts(Object.fromEntries(entries))
  }, [account])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!account) return null

  return (
    <div className="page">
      <h1 className={styles.title}>{mode === 'flashcard' ? 'フラッシュカード' : '4択クイズ'}</h1>
      <p className={styles.lead}>学習する単語帳を選んでください</p>

      {tanchous.length === 0 && (
        <div className={styles.empty}>
          <p>まだ単語帳がありません。先に単語帳を作成してください。</p>
          <Button variant="secondary" onClick={() => navigate(routes.top)}>
            単語帳へ
          </Button>
        </div>
      )}

      {tanchous.map((t) => {
        const count = wordCounts[t.id] ?? 0
        const disabled = mode === 'quiz' && count < QUIZ_MIN_WORD_COUNT
        return (
          <div key={t.id} className={styles.item}>
            <button
              type="button"
              className={styles.itemButton}
              disabled={disabled}
              onClick={() => {
                if (disabled) return
                navigate(mode === 'flashcard' ? routes.flashcardFilter(t.id) : routes.quizFilter(t.id))
              }}
            >
              <span className={styles.name}>{t.name}</span>
              <span className={styles.count}>{count}単語</span>
            </button>
            {disabled && (
              <p className={styles.hint}>
                4単語以上単語帳に登録することでこの機能は利用できるようになります。たくさん単語を登録しよう！
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
