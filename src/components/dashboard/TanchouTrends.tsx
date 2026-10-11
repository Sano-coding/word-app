import { formatJstMonthDay } from '@/domain/dashboardStats'
import styles from './TanchouTrends.module.css'

interface TanchouTrendsProps {
  mostActive: { tanchouName: string; shownCount: number } | null
  mostRecent: { tanchouName: string; lastStudiedAt: string } | null
}

export function TanchouTrends({ mostActive, mostRecent }: TanchouTrendsProps) {
  if (!mostActive && !mostRecent) {
    return (
      <p className={styles.empty}>
        まだ学習記録がありません。フラッシュカードや4択クイズに取り組むと、ここに表示されます。
      </p>
    )
  }

  return (
    <>
      {mostActive && (
        <div className={styles.row}>
          <div className={styles.icon}>🔥</div>
          <div className={styles.body}>
            <p className={styles.label}>最も取り組んでいる単語帳</p>
            <p className={styles.name}>{mostActive.tanchouName}</p>
            <p className={styles.meta}>
              出題済み合計 <b>{mostActive.shownCount}</b>語
            </p>
          </div>
        </div>
      )}

      {mostRecent && (
        <div className={styles.row}>
          <div className={styles.icon}>🕐</div>
          <div className={styles.body}>
            <p className={styles.label}>直近で取り組んだ単語帳</p>
            <p className={styles.name}>{mostRecent.tanchouName}</p>
            <p className={styles.meta}>
              <b>{formatJstMonthDay(mostRecent.lastStudiedAt)}</b> に学習
            </p>
          </div>
        </div>
      )}
    </>
  )
}
