import { STARRED_ICON, UNSTARRED_ICON } from '@/domain/labels'
import styles from './StarButton.module.css'

interface StarButtonProps {
  isStarred: boolean
  onToggle: () => void
}

export function StarButton({ isStarred, onToggle }: StarButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onToggle}
      aria-pressed={isStarred}
      aria-label={isStarred ? 'スターを解除' : 'スターを付ける'}
    >
      {isStarred ? STARRED_ICON : UNSTARRED_ICON}
    </button>
  )
}
