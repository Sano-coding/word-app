import { StarButton } from '@/components/session/StarButton'
import type { Word } from '@/types'
import styles from './TanchouCard.module.css'

interface TanchouCardProps {
  name: string
  words: Word[]
  isStarred: boolean
  onClick: () => void
  onToggleStar: () => void
  onRename: () => void
  onDelete: () => void
}

export function TanchouCard({ name, words, isStarred, onClick, onToggleStar, onRename, onDelete }: TanchouCardProps) {
  const memorized = words.filter((w) => w.masteryLevel === 'memorized').length
  const partially = words.filter((w) => w.masteryLevel === 'partially_memorized').length
  const notMemorized = words.filter((w) => w.masteryLevel === 'not_memorized').length

  return (
    <div className={styles.card}>
      <button type="button" className={styles.main} onClick={onClick}>
        <span className={styles.name}>{name}</span>
        <span className={styles.count}>{words.length}単語</span>
        {words.length > 0 && (
          <span className={styles.breakdown}>
            覚えた {memorized} ／ 少し覚えた {partially} ／ 覚えていない {notMemorized}
          </span>
        )}
      </button>
      <div className={styles.actions}>
        <StarButton isStarred={isStarred} onToggle={onToggleStar} />
        <button type="button" className={styles.actionButton} onClick={onRename} aria-label="名前を変更">
          ✏️
        </button>
        <button
          type="button"
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={onDelete}
          aria-label="削除"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
