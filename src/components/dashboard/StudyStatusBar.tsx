import { STUDY_STATUS_ICONS } from '@/domain/labels'
import type { StudyStatusCounts } from '@/domain/dashboardStats'
import styles from './StudyStatusBar.module.css'

interface StudyStatusBarProps {
  icon: string
  label: string
  counts: StudyStatusCounts
}

export function StudyStatusBar({ icon, label, counts }: StudyStatusBarProps) {
  const { shown, notShown } = counts
  const total = shown + notShown
  const shownPercent = total > 0 ? (shown / total) * 100 : 0

  return (
    <div className={styles.row}>
      <div className={styles.head}>
        {icon} {label}
      </div>
      <div
        className={styles.track}
        role="img"
        aria-label={`${label}：出題済 ${shown}語、未出題 ${notShown}語`}
      >
        <div className={styles.fill} style={{ width: `${shownPercent}%` }} />
      </div>
      <div className={styles.badges}>
        <span className={`${styles.badge} ${styles.shown}`}>
          {STUDY_STATUS_ICONS.shown} {shown}
        </span>
        <span className={`${styles.badge} ${styles.notShown}`}>
          {STUDY_STATUS_ICONS.not_shown} {notShown}
        </span>
      </div>
    </div>
  )
}
