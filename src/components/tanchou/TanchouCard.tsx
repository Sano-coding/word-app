import { StarButton } from '@/components/session/StarButton'
import { MASTERY_LEVEL_ICONS, MASTERY_LEVEL_LABELS } from '@/domain/labels'
import type { Word } from '@/types'
import type { HTMLAttributes } from 'react'
import styles from './TanchouCard.module.css'

interface TanchouCardProps {
  name: string
  words: Word[]
  isStarred: boolean
  onClick: () => void
  onToggleStar: () => void
  onRename: () => void
  onDelete: () => void
  dragHandleRef?: (node: HTMLElement | null) => void
  dragHandleAttributes?: HTMLAttributes<HTMLButtonElement>
  dragHandleListeners?: HTMLAttributes<HTMLButtonElement>
}

export function TanchouCard({
  name,
  words,
  isStarred,
  onClick,
  onToggleStar,
  onRename,
  onDelete,
  dragHandleRef,
  dragHandleAttributes,
  dragHandleListeners,
}: TanchouCardProps) {
  const memorized = words.filter((w) => w.masteryLevel === 'memorized').length
  const partially = words.filter((w) => w.masteryLevel === 'partially_memorized').length
  const notMemorized = words.filter((w) => w.masteryLevel === 'not_memorized').length

  return (
    <div className={styles.card}>
      {dragHandleRef && (
        <button
          type="button"
          ref={dragHandleRef}
          className={styles.dragHandle}
          aria-label="ドラッグして並び替え"
          {...dragHandleAttributes}
          {...dragHandleListeners}
        >
          ⠿
        </button>
      )}
      <button type="button" className={styles.main} onClick={onClick}>
        <span className={styles.name}>{name}</span>
        <span className={styles.count}>{words.length}単語</span>
        {words.length > 0 && (
          <span className={styles.breakdown}>
            <span
              className={styles.badgeNotMemorized}
              aria-label={`${MASTERY_LEVEL_LABELS.not_memorized} ${notMemorized}件`}
            >
              {MASTERY_LEVEL_ICONS.not_memorized} {notMemorized}
            </span>
            <span
              className={styles.badgePartially}
              aria-label={`${MASTERY_LEVEL_LABELS.partially_memorized} ${partially}件`}
            >
              {MASTERY_LEVEL_ICONS.partially_memorized} {partially}
            </span>
            <span className={styles.badgeMemorized} aria-label={`${MASTERY_LEVEL_LABELS.memorized} ${memorized}件`}>
              {MASTERY_LEVEL_ICONS.memorized} {memorized}
            </span>
          </span>
        )}
      </button>
      <div className={styles.actions}>
        <StarButton isStarred={isStarred} onToggle={onToggleStar} />
        <button type="button" className={styles.actionButton} onClick={onRename} aria-label="名前を変更">
          ✏️
        </button>
        <button type="button" className={styles.actionButton} onClick={onDelete} aria-label="削除">
          🗑️
        </button>
      </div>
    </div>
  )
}
