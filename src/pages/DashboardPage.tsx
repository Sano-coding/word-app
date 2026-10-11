import { useCallback, useEffect, useState } from 'react'
import { MasteryBarChart } from '@/components/dashboard/MasteryBarChart'
import { MasteryLineChart } from '@/components/dashboard/MasteryLineChart'
import { StudyStatusBar } from '@/components/dashboard/StudyStatusBar'
import { TanchouTrends } from '@/components/dashboard/TanchouTrends'
import { useAccount } from '@/context/AccountContext'
import {
  countWordsByMastery,
  countWordsByStudyStatus,
  findMostActiveTanchou,
  findMostRecentlyStudiedTanchou,
  getTodayJstDateString,
  mergeTodaySnapshot,
} from '@/domain/dashboardStats'
import type { MasteryCounts, StudyStatusCounts } from '@/domain/dashboardStats'
import { listMasterySnapshots } from '@/repositories/masterySnapshotRepository'
import { listTanchous } from '@/repositories/tanchouRepository'
import { listWords } from '@/repositories/wordRepository'
import type { MasterySnapshot } from '@/types'
import styles from './DashboardPage.module.css'

const EMPTY_COUNTS: MasteryCounts = { not_memorized: 0, partially_memorized: 0, memorized: 0 }
const EMPTY_STUDY_STATUS: StudyStatusCounts = { shown: 0, notShown: 0 }

interface MostActive {
  tanchouName: string
  shownCount: number
}

interface MostRecent {
  tanchouName: string
  lastStudiedAt: string
}

export default function DashboardPage() {
  const { account } = useAccount()
  const [counts, setCounts] = useState<MasteryCounts>(EMPTY_COUNTS)
  const [history, setHistory] = useState<MasterySnapshot[]>([])
  const [flashcardStatus, setFlashcardStatus] = useState<StudyStatusCounts>(EMPTY_STUDY_STATUS)
  const [quizStatus, setQuizStatus] = useState<StudyStatusCounts>(EMPTY_STUDY_STATUS)
  const [mostActive, setMostActive] = useState<MostActive | null>(null)
  const [mostRecent, setMostRecent] = useState<MostRecent | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!account) return
    setLoading(true)
    const tanchous = await listTanchous(account.id)
    const wordLists = await Promise.all(tanchous.map((t) => listWords(t.id)))
    const words = wordLists.flat()
    const currentCounts = countWordsByMastery(words)
    const snapshots = await listMasterySnapshots(account.id)
    setCounts(currentCounts)
    setHistory(mergeTodaySnapshot(snapshots, getTodayJstDateString(), currentCounts))
    setFlashcardStatus(countWordsByStudyStatus(words, 'flashcardStatus'))
    setQuizStatus(countWordsByStudyStatus(words, 'quizStatus'))

    const active = findMostActiveTanchou(tanchous, wordLists)
    setMostActive(active ? { tanchouName: active.tanchou.name, shownCount: active.shownCount } : null)
    const recent = findMostRecentlyStudiedTanchou(tanchous)
    setMostRecent(recent?.lastStudiedAt ? { tanchouName: recent.name, lastStudiedAt: recent.lastStudiedAt } : null)

    setLoading(false)
  }, [account])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!account) return null

  const totalWords = counts.not_memorized + counts.partially_memorized + counts.memorized

  return (
    <div className="page">
      <h1 className={styles.title}>ダッシュボード</h1>

      {loading ? (
        <p className={styles.loading}>読み込み中...</p>
      ) : totalWords === 0 ? (
        <p className={styles.empty}>まだ単語が登録されていません。単語帳に単語を追加すると、ここに定着度の状況が表示されます。</p>
      ) : (
        <>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>単語帳の傾向</h2>
            <TanchouTrends mostActive={mostActive} mostRecent={mostRecent} />
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>定着度の内訳</h2>
            <MasteryBarChart counts={counts} />
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>定着度の推移</h2>
            <MasteryLineChart data={history} />
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>出題状況</h2>
            <StudyStatusBar icon="🃏" label="フラッシュカード" counts={flashcardStatus} />
            <StudyStatusBar icon="❓" label="4択クイズ" counts={quizStatus} />
          </section>
        </>
      )}
    </div>
  )
}
