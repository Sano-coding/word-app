import styles from './ProgressIndicator.module.css'

interface ProgressIndicatorProps {
  current: number
  total: number
  unit: string
}

export function ProgressIndicator({ current, total, unit }: ProgressIndicatorProps) {
  return (
    <p className={styles.progress}>
      {current}{unit}目 / {total}{unit}
    </p>
  )
}
