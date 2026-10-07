import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/common/Button'
import { ConfirmDeleteDialog } from '@/components/tanchou/ConfirmDeleteDialog'
import { SortableTanchouCard } from '@/components/tanchou/SortableTanchouCard'
import { StarFilterChips } from '@/components/tanchou/StarFilterChips'
import { TanchouCard } from '@/components/tanchou/TanchouCard'
import { TanchouFormDialog } from '@/components/tanchou/TanchouFormDialog'
import { useAccount } from '@/context/AccountContext'
import {
  STAR_FILTER_EMPTY_MESSAGES,
  countTanchousByStar,
  filterTanchousByStar,
} from '@/domain/tanchouFilter'
import type { StarFilter } from '@/domain/tanchouFilter'
import {
  createTanchou,
  deleteTanchou,
  listTanchous,
  renameTanchou,
  reorderTanchous,
  setTanchouStarred,
} from '@/repositories/tanchouRepository'
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
  const [starFilter, setStarFilter] = useState<StarFilter>('all')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tanchous.findIndex((t) => t.id === active.id)
    const newIndex = tanchous.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(tanchous, oldIndex, newIndex)
    setTanchous(reordered)
    try {
      await reorderTanchous(reordered.map((t) => t.id))
    } catch {
      await refresh()
    }
  }

  if (!account) return null

  const visibleTanchous = filterTanchousByStar(tanchous, starFilter)
  const counts = countTanchousByStar(tanchous)

  /** 絞り込み中はカードの並び替えを無効化するため、ドラッグ可否で2通りの描画をする */
  function cardPropsFor(t: Tanchou) {
    return {
      name: t.name,
      words: wordsByTanchou[t.id] ?? [],
      isStarred: t.isStarred,
      onClick: () => navigate(routes.submenu(t.id)),
      onToggleStar: async () => {
        await setTanchouStarred(t.id, !t.isStarred)
        await refresh()
      },
      onRename: () => setRenaming(t),
      onDelete: () => setDeleting(t),
    }
  }

  return (
    <div className="page">
      <div className={styles.headerRow}>
        <h1 className={styles.title}>単語帳</h1>
        <Button onClick={() => setCreating(true)}>➕ 新規作成</Button>
      </div>

      {tanchous.length > 0 && (
        <StarFilterChips value={starFilter} counts={counts} onChange={setStarFilter} />
      )}

      {visibleTanchous.length === 0 && (
        <p className={styles.empty}>{STAR_FILTER_EMPTY_MESSAGES[tanchous.length === 0 ? 'all' : starFilter]}</p>
      )}

      {starFilter === 'all' ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tanchous.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tanchous.map((t) => (
              <SortableTanchouCard key={t.id} id={t.id} {...cardPropsFor(t)} />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <>
          {visibleTanchous.length > 0 && (
            <p className={styles.reorderHint}>絞り込み中は並び替えできません。「すべて」を選ぶと並び替えできます。</p>
          )}
          {visibleTanchous.map((t) => (
            <TanchouCard key={t.id} {...cardPropsFor(t)} />
          ))}
        </>
      )}

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
