import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.shell}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.content}>
        <div className={styles.mobileBar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setSidebarOpen(true)}
            aria-label="メニューを開く"
          >
            ☰
          </button>
          <span className={styles.mobileTitle}>単語帳</span>
        </div>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
