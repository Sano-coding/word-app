import type { ReactNode } from 'react'
import styles from './BottomActionBar.module.css'

interface BottomActionBarProps {
  children: ReactNode
}

/** セッション系画面の主要アクションボタンを画面下端に固定表示する共通コンポーネント */
export function BottomActionBar({ children }: BottomActionBarProps) {
  return (
    <>
      <div className={styles.spacer} />
      <div className={styles.bar}>
        <div className={styles.inner}>{children}</div>
      </div>
    </>
  )
}
