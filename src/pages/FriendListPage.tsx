import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AvatarIcon } from '@/components/account/AvatarIcon'
import { Button } from '@/components/common/Button'
import { ConfirmDeleteDialog } from '@/components/tanchou/ConfirmDeleteDialog'
import { splitFriendships } from '@/domain/friendships'
import { listMyFriendships, removeFriendship } from '@/repositories/friendshipRepository'
import { routes } from '@/routes'
import type { Friendship } from '@/types'
import styles from './FriendListPage.module.css'

export default function FriendListPage() {
  const navigate = useNavigate()
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<Friendship | null>(null)

  const refresh = useCallback(async () => {
    setFriendships(await listMyFriendships())
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleRemoveConfirmed() {
    if (!removing) return
    await removeFriendship(removing.id)
    setRemoving(null)
    await refresh()
  }

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
        <ul className={styles.list}>
          {friends.map((friendship) => (
            <li key={friendship.id} className={styles.row}>
              <AvatarIcon iconType={friendship.otherIconType} iconValue={friendship.otherIconValue} size={40} />
              <div className={styles.nameBlock}>
                <p className={styles.name}>{friendship.otherNickname}</p>
                {friendship.otherStatusMessage && <p className={styles.status}>{friendship.otherStatusMessage}</p>}
              </div>
              <button
                type="button"
                className={styles.removeButton}
                aria-label={`${friendship.otherNickname} をフレンド解除`}
                onClick={() => setRemoving(friendship)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {removing && (
        <ConfirmDeleteDialog
          title="フレンド解除"
          message={`${removing.otherNickname} をフレンドから解除しますか？`}
          confirmLabel="解除する"
          onConfirm={handleRemoveConfirmed}
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  )
}
