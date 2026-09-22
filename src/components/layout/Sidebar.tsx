import { useLocation, useNavigate } from 'react-router-dom'
import { AvatarIcon } from '@/components/account/AvatarIcon'
import { useAccount } from '@/context/AccountContext'
import { routes } from '@/routes'
import styles from './Sidebar.module.css'

interface NavItem {
  key: string
  icon: string
  label: string
  path: string
  isActive: (pathname: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'home',
    icon: '🏠',
    label: 'ホーム',
    path: routes.home,
    isActive: (pathname) => pathname === routes.home,
  },
  {
    key: 'profile',
    icon: '👤',
    label: 'プロフィール',
    path: routes.settings,
    isActive: (pathname) => pathname === routes.settings,
  },
  {
    key: 'wordbooks',
    icon: '📚',
    label: '単語帳',
    path: routes.top,
    isActive: (pathname) => pathname === routes.top || /^\/tanchou\/[^/]+(\/words)?$/.test(pathname),
  },
  {
    key: 'flashcard',
    icon: '🃏',
    label: 'フラッシュカード',
    path: routes.flashcardHub,
    isActive: (pathname) => pathname === routes.flashcardHub || /^\/tanchou\/[^/]+\/flashcard$/.test(pathname),
  },
  {
    key: 'quiz',
    icon: '❓',
    label: '4択クイズ',
    path: routes.quizHub,
    isActive: (pathname) => pathname === routes.quizHub || /^\/tanchou\/[^/]+\/quiz$/.test(pathname),
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { account } = useAccount()
  const navigate = useNavigate()
  const location = useLocation()

  function handleNavigate(path: string) {
    navigate(path)
    onClose()
  }

  return (
    <nav className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      {account && (
        <div className={styles.header}>
          <div className={styles.identity}>
            <AvatarIcon iconType={account.iconType} iconValue={account.iconValue} size={36} />
            <span className={styles.nickname}>{account.nickname}</span>
          </div>
        </div>
      )}

      <ul className={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className={`${styles.navItem} ${item.isActive(location.pathname) ? styles.active : ''}`}
              onClick={() => handleNavigate(item.path)}
            >
              <span className={styles.icon}>{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
