import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { ConfirmDeleteDialog } from '@/components/tanchou/ConfirmDeleteDialog'
import { TanchouCard } from '@/components/tanchou/TanchouCard'
import { TanchouFormDialog } from '@/components/tanchou/TanchouFormDialog'
import { useAccount } from '@/context/AccountContext'
import { createTanchou, deleteTanchou, listTanchous, renameTanchou, setTanchouStarred } from '@/repositories/tanchouRepository'
import { listWords } from '@/repositories/wordRepository'
import { routes } from '@/routes'
import type { Tanchou, Word } from '@/types'
import styles from './TopPage.module.css'

export default function TopPage() {
  const navigate = useNavigate()
  const { account } = useAccount()
  const [tanchous, setTanchous] = useState<Tanchou[]>([])
  const [wordsByTanchou, setWordsByTanchou] = useState<Record<string, Word[]>>({})
  const [creating, setCreating] = useState(false)
  const [renaming, setRenaming] = useState<Tanchou | null>(null)
  const [deleting, setDeleting] = useState<Tanchou | null>(null)

  const refresh = useCallback(async () => {
    if (!account) return
    const list = await listTanchous(account.id)
    setTanchous(list)
    const entries = await Promise.all(list.map(async (t) => [t.id, await listWords(t.id)] as const))
    setWordsByTanchou(Object.fromEntries(entries))
  }, [account])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!account) return null

  return (
    <div className="page">
      <div className={styles.headerRow}>
        <h1 className={styles.title}>単語帳</h1>
        <Button onClick={() => setCreating(true)}>+ 新規作成</Button>
      </div>

      {tanchous.length === 0 && (
        <p className={styles.empty}>まだ単語帳がありません。「+ 新規作成」から作成しましょう。</p>
      )}

      {tanchous.map((t) => (
        <TanchouCard
          key={t.id}
          name={t.name}
          words={wordsByTanchou[t.id] ?? []}
          isStarred={t.isStarred}
          onClick={() => navigate(routes.submenu(t.id))}
          onToggleStar={async () => {
            await setTanchouStarred(t.id, !t.isStarred)
            await refresh()
          }}
          onRename={() => setRenaming(t)}
          onDelete={() => setDeleting(t)}
        />
      ))}

      {creating && (
        <TanchouFormDialog
          title="単語帳を作成"
          onClose={() => setCreating(false)}
          onSubmit={async (name) => {
            const tanchou = await createTanchou(account.id, name)
            setCreating(false)
            navigate(routes.wordList(tanchou.id), { state: { openCreateModal: true } })
          }}
        />
      )}

      {renaming && (
        <TanchouFormDialog
          title="単語帳名を変更"
          initialName={renaming.name}
          onClose={() => setRenaming(null)}
          onSubmit={async (name) => {
            await renameTanchou(renaming.id, name)
            setRenaming(null)
            await refresh()
          }}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          title="単語帳を削除"
          message={`「${deleting.name}」を削除します。この操作は取り消せません。よろしいですか？`}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await deleteTanchou(deleting.id)
            setDeleting(null)
            await refresh()
          }}
        />
      )}
    </div>
  )
}
