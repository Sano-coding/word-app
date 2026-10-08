import { useCallback, useEffect, useState } from 'react'
import { MasteryBarChart } from '@/components/dashboard/MasteryBarChart'
import { MasteryLineChart } from '@/components/dashboard/MasteryLineChart'
import { useAccount } from '@/context/AccountContext'
import { countWordsByMastery, getTodayJstDateString, mergeTodaySnapshot } from '@/domain/dashboardStats'
import type { MasteryCounts } from '@/domain/dashboardStats'
import { listMasterySnapshots } from '@/repositories/masterySnapshotRepository'
import { listTanchous } from '@/repositories/tanchouRepository'
import { listWords } from '@/repositories/wordRepository'
import type { MasterySnapshot } from '@/types'
import styles from './DashboardPage.module.css'

const EMPTY_COUNTS: MasteryCounts = { not_memorized: 0, partially_memorized: 0, memorized: 0 }

export default function DashboardPage() {
  const { account } = useAccount()
  const [counts, setCounts] = useState<MasteryCounts>(EMPTY_COUNTS)
  const [history, setHistory] = useState<MasterySnapshot[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!account) return
    setLoading(true)
    const tanchous = await listTanchous(account.id)
    const wordLists = await Promise.all(tanchous.map((t) => listWords(t.id)))
    const currentCounts = countWordsByMastery(wordLists.flat())
    const snapshots = await listMasterySnapshots(account.id)
    setCounts(currentCounts)
    setHistory(mergeTodaySnapshot(snapshots, getTodayJstDateString(), currentCounts))
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
            <h2 className={styles.cardTitle}>定着度の内訳</h2>
            <MasteryBarChart counts={counts} />
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>定着度の推移</h2>
            <MasteryLineChart data={history} />
          </section>
        </>
      )}
    </div>
  )
}
