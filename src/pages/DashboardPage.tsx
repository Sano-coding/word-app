import { useCallback, useEffect, useState } from 'react'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { useAccount } from '@/context/AccountContext'
import { buildDashboardData, getTodayJstDateString } from '@/domain/dashboardStats'
import type { DashboardData } from '@/domain/dashboardStats'
import { listMasterySnapshots } from '@/repositories/masterySnapshotRepository'
import { listTanchous } from '@/repositories/tanchouRepository'
import { listWords } from '@/repositories/wordRepository'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { account } = useAccount()
  const [data, setData] = useState<DashboardData | null>(null)

  const refresh = useCallback(async () => {
    if (!account) return
    setData(null)
    const tanchous = await listTanchous(account.id)
    const wordLists = await Promise.all(tanchous.map((t) => listWords(t.id)))
    const snapshots = await listMasterySnapshots(account.id)
    setData(buildDashboardData(tanchous, wordLists, snapshots, getTodayJstDateString()))
  }, [account])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!account) return null

  return (
    <div className="page">
      <h1 className={styles.title}>ダッシュボード</h1>

      {data === null ? (
        <p className={styles.loading}>読み込み中...</p>
      ) : (
        <DashboardView
          data={data}
          emptyMessage="まだ単語が登録されていません。単語帳に単語を追加すると、ここに定着度の状況が表示されます。"
        />
      )}
    </div>
  )
}
