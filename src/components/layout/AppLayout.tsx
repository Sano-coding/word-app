import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useLibraryStats } from '@/hooks/useLibraryStats'
import { Sidebar } from './Sidebar'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { tanchouCount, wordCount } = useLibraryStats()

  return (
    <div className={styles.shell}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.content}>
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setSidebarOpen(true)}
              aria-label="メニューを開く"
            >
              ☰
            </button>
            <span className={styles.headerTitle}>単語帳</span>
          </div>

          <div className={styles.stats}>
            <span className={styles.statItem}>単語帳 {tanchouCount}冊</span>
            <span className={styles.statDivider} />
            <span className={styles.statItem}>単語 {wordCount}語</span>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
