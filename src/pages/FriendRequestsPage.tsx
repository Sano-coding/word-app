import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AvatarIcon } from '@/components/account/AvatarIcon'
import { Button } from '@/components/common/Button'
import { useAccount } from '@/context/AccountContext'
import { findFriendshipWithUser, splitFriendships } from '@/domain/friendships'
import {
  acceptFriendRequest,
  listMyFriendships,
  removeFriendship,
  searchProfiles,
  sendFriendRequest,
} from '@/repositories/friendshipRepository'
import { routes } from '@/routes'
import type { Friendship, ProfileSearchResult } from '@/types'
import styles from './FriendRequestsPage.module.css'

type Tab = 'search' | 'incoming' | 'outgoing'

export default function FriendRequestsPage() {
  const navigate = useNavigate()
  const { account } = useAccount()
  const [tab, setTab] = useState<Tab>('search')
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProfileSearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)

  const refresh = useCallback(async () => {
    setFriendships(await listMyFriendships())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      setSearchResults(null)
      return
    }
    setSearching(true)
    setSearchResults(await searchProfiles(trimmed))
    setSearching(false)
  }

  async function handleSendRequest(targetId: string) {
    if (!account) return
    await sendFriendRequest(account.id, targetId)
    await refresh()
  }

  async function handleAccept(friendshipId: string) {
    await acceptFriendRequest(friendshipId)
    await refresh()
  }

  async function handleRemove(friendshipId: string) {
    await removeFriendship(friendshipId)
    await refresh()
  }

  const { incomingRequests, outgoingRequests } = splitFriendships(friendships)

  return (
    <div className="page">
      <Button variant="secondary" onClick={() => navigate(routes.friends)}>
        ← 戻る
      </Button>

      <h1 className={styles.title}>フレンド追加・管理</h1>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'search' ? styles.tabActive : ''}`}
          onClick={() => setTab('search')}
        >
          検索
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'incoming' ? styles.tabActive : ''}`}
          onClick={() => setTab('incoming')}
        >
          受信
          {incomingRequests.length > 0 && <span className={styles.badge}>{incomingRequests.length}</span>}
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'outgoing' ? styles.tabActive : ''}`}
          onClick={() => setTab('outgoing')}
        >
          送信
        </button>
      </div>

      {tab === 'search' && (
        <div>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ニックネームで検索"
              className={styles.searchInput}
            />
            <Button type="submit" aria-label="検索する">
              🔍
            </Button>
          </form>

          {searching ? (
            <p className={styles.empty}>検索中...</p>
          ) : searchResults === null ? (
            <p className={styles.empty}>ニックネームを入力して検索してください。</p>
          ) : searchResults.length === 0 ? (
            <p className={styles.empty}>見つかりませんでした。</p>
          ) : (
            <ul className={styles.list}>
              {searchResults.map((result) => {
                const existing = findFriendshipWithUser(friendships, result.id)
                return (
                  <li key={result.id} className={styles.row}>
                    <AvatarIcon iconType={result.iconType} iconValue={result.iconValue} size={36} />
                    <span className={styles.name}>{result.nickname}</span>
                    {existing?.status === 'accepted' ? (
                      <span className={styles.statusLabel}>フレンド済み</span>
                    ) : existing?.status === 'pending' ? (
                      <span className={styles.statusLabel}>申請済み</span>
                    ) : (
                      <Button onClick={() => handleSendRequest(result.id)}>申請する</Button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {tab === 'incoming' && (
        <div>
          {incomingRequests.length === 0 ? (
            <p className={styles.empty}>受信した申請はありません。</p>
          ) : (
            <ul className={styles.list}>
              {incomingRequests.map((req) => (
                <li key={req.id} className={styles.row}>
                  <AvatarIcon iconType={req.otherIconType} iconValue={req.otherIconValue} size={36} />
                  <span className={styles.name}>{req.otherNickname}</span>
                  <Button variant="success" aria-label={`${req.otherNickname} の申請を承認`} onClick={() => handleAccept(req.id)}>
                    ✓ 承認
                  </Button>
                  <Button
                    variant="secondary"
                    aria-label={`${req.otherNickname} の申請を拒否`}
                    onClick={() => handleRemove(req.id)}
                  >
                    ✕
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'outgoing' && (
        <div>
          {outgoingRequests.length === 0 ? (
            <p className={styles.empty}>送信した申請はありません。</p>
          ) : (
            <ul className={styles.list}>
              {outgoingRequests.map((req) => (
                <li key={req.id} className={styles.row}>
                  <AvatarIcon iconType={req.otherIconType} iconValue={req.otherIconValue} size={36} />
                  <div className={styles.nameBlock}>
                    <p className={styles.name}>{req.otherNickname}</p>
                    <p className={styles.meta}>承認待ち</p>
                  </div>
                  <Button variant="secondary" onClick={() => handleRemove(req.id)}>
                    キャンセル
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
