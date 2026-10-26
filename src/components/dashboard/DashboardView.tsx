import { MasteryBarChart } from '@/components/dashboard/MasteryBarChart'
import { MasteryLineChart } from '@/components/dashboard/MasteryLineChart'
import { StudyStatusBar } from '@/components/dashboard/StudyStatusBar'
import { TanchouTrends } from '@/components/dashboard/TanchouTrends'
import type { DashboardData } from '@/domain/dashboardStats'
import styles from './DashboardView.module.css'

interface DashboardViewProps {
  data: DashboardData
  /** 単語が1語も無いときに表示する文言 */
  emptyMessage: string
}

/** ダッシュボードのカード群。自分のダッシュボードとフレンドのダッシュボードで共通 */
export function DashboardView({ data, emptyMessage }: DashboardViewProps) {
  const { counts } = data
  const totalWords = counts.not_memorized + counts.partially_memorized + counts.memorized

  if (totalWords === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>
  }

  return (
    <>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>単語帳の傾向</h2>
        <TanchouTrends mostActive={data.mostActive} mostRecent={data.mostRecent} />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>定着度の内訳</h2>
        <MasteryBarChart counts={counts} />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>定着度の推移</h2>
        <MasteryLineChart data={data.history} />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>出題状況</h2>
        <StudyStatusBar icon="🃏" label="フラッシュカード" counts={data.flashcardStatus} />
        <StudyStatusBar icon="❓" label="4択クイズ" counts={data.quizStatus} />
      </section>
    </>
  )
}
