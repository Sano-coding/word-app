import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AvatarIcon } from '@/components/account/AvatarIcon'
import { Button } from '@/components/common/Button'
import { splitFriendships } from '@/domain/friendships'
import { listMyFriendships } from '@/repositories/friendshipRepository'
import { routes } from '@/routes'
import type { Friendship } from '@/types'
import styles from './FriendListPage.module.css'

export default function FriendListPage() {
  const navigate = useNavigate()
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listMyFriendships().then((result) => {
      setFriendships(result)
      setLoading(false)
    })
  }, [])

  const { friends } = splitFriendships(friendships)

  return (
    <div className="page">
      <div className={styles.headerRow}>
        <h1 className={styles.title}>フレンド</h1>
        <div className={styles.headerActions}>
          <Button onClick={() => navigate(routes.friendRequests)}>👤+ 追加</Button>
        </div>
      </div>

      {loading ? (
        <p className={styles.empty}>読み込み中...</p>
      ) : friends.length === 0 ? (
        <p className={styles.empty}>まだフレンドがいません。「追加」から探してみましょう。</p>
      ) : (
        <>
          <p className={styles.hint}>カードをタップすると、フレンドのダッシュボードを見られます</p>
          <ul className={styles.list}>
            {friends.map((friendship) => (
              <li key={friendship.id}>
                <button
                  type="button"
                  className={styles.row}
                  onClick={() => navigate(routes.friendDashboard(friendship.otherId))}
                >
                  <AvatarIcon iconType={friendship.otherIconType} iconValue={friendship.otherIconValue} size={40} />
                  <span className={styles.nameBlock}>
                    <span className={styles.name}>{friendship.otherNickname}</span>
                    {friendship.otherStatusMessage && <span className={styles.status}>{friendship.otherStatusMessage}</span>}
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
