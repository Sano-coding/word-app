import { StarButton } from '@/components/session/StarButton'
import { MASTERY_LEVELS, MASTERY_LEVEL_LABELS, STUDY_STATUSES, STUDY_STATUS_LABELS } from '@/domain/labels'
import type { MasteryLevel, StudyStatus, Word } from '@/types'
import styles from './WordTable.module.css'

interface WordTableRowProps {
  word: Word
  onUpdate: (patch: Partial<Pick<Word, 'masteryLevel' | 'flashcardStatus' | 'quizStatus' | 'isStarred'>>) => void
  onEdit: () => void
  onDelete: () => void
}

export function WordTableRow({ word, onUpdate, onEdit, onDelete }: WordTableRowProps) {
  return (
    <tr>
      <td className={styles.wordCell}>
        <button type="button" className={styles.wordButton} onClick={onEdit}>
          {word.word}
        </button>
      </td>
      <td>{word.meaning}</td>
      <td>
        <select
          className={styles.select}
          value={word.masteryLevel}
          onChange={(e) => onUpdate({ masteryLevel: e.target.value as MasteryLevel })}
        >
          {MASTERY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {MASTERY_LEVEL_LABELS[level]}
            </option>
          ))}
        </select>
      </td>
      <td>
        <select
          className={styles.select}
          value={word.flashcardStatus}
          onChange={(e) => onUpdate({ flashcardStatus: e.target.value as StudyStatus })}
        >
          {STUDY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STUDY_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </td>
      <td>
        <select
          className={styles.select}
          value={word.quizStatus}
          onChange={(e) => onUpdate({ quizStatus: e.target.value as StudyStatus })}
        >
          {STUDY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STUDY_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </td>
      <td>
        <StarButton isStarred={word.isStarred} onToggle={() => onUpdate({ isStarred: !word.isStarred })} />
      </td>
      <td>
        <button type="button" className={styles.deleteButton} onClick={onDelete} aria-label="削除">
          削除
        </button>
      </td>
    </tr>
  )
}
