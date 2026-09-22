import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TanchouCard } from './TanchouCard'
import type { Word } from '@/types'

interface SortableTanchouCardProps {
  id: string
  name: string
  words: Word[]
  isStarred: boolean
  onClick: () => void
  onToggleStar: () => void
  onRename: () => void
  onDelete: () => void
}

export function SortableTanchouCard({ id, ...cardProps }: SortableTanchouCardProps) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TanchouCard
        {...cardProps}
        dragHandleRef={setActivatorNodeRef}
        dragHandleAttributes={attributes}
        dragHandleListeners={listeners}
      />
    </div>
  )
}
