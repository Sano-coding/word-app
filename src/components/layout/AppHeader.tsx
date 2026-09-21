import { useNavigate } from 'react-router-dom'
import { AvatarIcon } from '@/components/account/AvatarIcon'
import { useAccount } from '@/context/AccountContext'
import { routes } from '@/routes'
import styles from './AppHeader.module.css'

export function AppHeader() {
  const navigate = useNavigate()
  const { account } = useAccount()

  if (!account) return null

  return (
    <button type="button" className={styles.header} onClick={() => navigate(routes.settings)}>
      <AvatarIcon iconType={account.iconType} iconValue={account.iconValue} size={40} />
      <span className={styles.nickname}>{account.nickname}</span>
    </button>
  )
}
