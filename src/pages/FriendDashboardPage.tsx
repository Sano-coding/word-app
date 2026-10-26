import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AvatarIcon } from '@/components/account/AvatarIcon'
import { Button } from '@/components/common/Button'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { ConfirmDeleteDialog } from '@/components/tanchou/ConfirmDeleteDialog'
import { buildDashboardData, getTodayJstDateString } from '@/domain/dashboardStats'
import type { DashboardData } from '@/domain/dashboardStats'
import { getFriendDashboard, listMyFriendships, removeFriendship } from '@/repositories/friendshipRepository'
import { routes } from '@/routes'
import type { Friendship } from '@/types'
import styles from './FriendDashboardPage.module.css'

type LoadState =
  | { kind: 'loading' }
  | { kind: 'notFound' }
  /** data が null のときは、相手がダッシュボードを非公開にしている */
  | { kind: 'ready'; friendship: Friendship; data: DashboardData | null }

export default function FriendDashboardPage() {
  const { friendId } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    if (!friendId) return
    let cancelled = false

    async function load(id: string) {
      const friendships = await listMyFriendships()
      const friendship = friendships.find((f) => f.status === 'accepted' && f.otherId === id)
      if (!friendship) {
        if (!cancelled) setState({ kind: 'notFound' })
        return
      }
      const dashboard = await getFriendDashboard(id)
      if (cancelled) return
      const data = dashboard.isPublic
        ? buildDashboardData(
            dashboard.tanchous,
            dashboard.tanchous.map((t) => t.words),
            dashboard.snapshots,
            getTodayJstDateString(),
          )
        : null
      setState({ kind: 'ready', friendship, data })
    }

    load(friendId)
    return () => {
      cancelled = true
    }
  }, [friendId])

  async function handleRemoveConfirmed() {
    if (state.kind !== 'ready') return
    await removeFriendship(state.friendship.id)
    navigate(routes.friends)
  }

  return (
    <div className="page">
      <button type="button" className={styles.backLink} onClick={() => navigate(routes.friends)}>
        ← フレンド一覧
      </button>

      {state.kind === 'loading' && <p className={styles.muted}>読み込み中...</p>}

      {state.kind === 'notFound' && <p className={styles.muted}>フレンドが見つかりませんでした。</p>}

      {state.kind === 'ready' && (
        <>
          <section className={styles.profile}>
            <AvatarIcon iconType={state.friendship.otherIconType} iconValue={state.friendship.otherIconValue} size={56} />
            <div className={styles.profileText}>
              <h1 className={styles.title}>{state.friendship.otherNickname} さんのダッシュボード</h1>
              {state.friendship.otherStatusMessage && (
                <p className={styles.status}>{state.friendship.otherStatusMessage}</p>
              )}
            </div>
          </section>

          {state.data ? (
            <>
              <DashboardView data={state.data} emptyMessage="まだ単語が登録されていません。" />
              <p className={styles.muted}>👀 閲覧のみ。単語の中身は表示されません</p>
            </>
          ) : (
            <section className={styles.privateCard}>
              <span className={styles.privateIcon}>🔒</span>
              <p className={styles.privateTitle}>ダッシュボードは非公開です</p>
              <p className={styles.muted}>
                {state.friendship.otherNickname} さんは、学習状況をフレンドに公開しない設定にしています。
              </p>
            </section>
          )}

          <div className={styles.removeRow}>
            <Button variant="danger" onClick={() => setRemoving(true)}>
              ✕ フレンド解除
            </Button>
          </div>

          {removing && (
            <ConfirmDeleteDialog
              title="フレンド解除"
              message={`${state.friendship.otherNickname} をフレンドから解除しますか？`}
              confirmLabel="解除する"
              onConfirm={handleRemoveConfirmed}
              onClose={() => setRemoving(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
