import { MASTERY_LEVELS, MASTERY_LEVEL_LABELS, STUDY_STATUSES, STUDY_STATUS_LABELS } from '@/domain/labels'
import type { Word } from '@/types'
import { WordTableRow } from './WordTableRow'
import styles from './WordTable.module.css'

interface WordTableProps {
  words: Word[]
  onUpdate: (id: string, patch: Partial<Pick<Word, 'masteryLevel' | 'flashcardStatus' | 'quizStatus' | 'isStarred'>>) => void
  onEdit: (word: Word) => void
  onDelete: (word: Word) => void
}

function countBy<T extends string>(words: Word[], key: 'masteryLevel' | 'flashcardStatus' | 'quizStatus', value: T) {
  return words.filter((w) => w[key] === value).length
}

export function WordTable({ words, onUpdate, onEdit, onDelete }: WordTableProps) {
  return (
    <div>
      <div className={styles.summary}>
        <div className={styles.summaryGroup}>
          <span className={styles.summaryTitle}>定着度</span>
          {MASTERY_LEVELS.map((level) => (
            <span key={level} className={styles.summaryItem}>
              {MASTERY_LEVEL_LABELS[level]} {countBy(words, 'masteryLevel', level)}
            </span>
          ))}
        </div>
        <div className={styles.summaryGroup}>
          <span className={styles.summaryTitle}>フラッシュカード</span>
          {STUDY_STATUSES.map((status) => (
            <span key={status} className={styles.summaryItem}>
              {STUDY_STATUS_LABELS[status]} {countBy(words, 'flashcardStatus', status)}
            </span>
          ))}
        </div>
        <div className={styles.summaryGroup}>
          <span className={styles.summaryTitle}>4択クイズ</span>
          {STUDY_STATUSES.map((status) => (
            <span key={status} className={styles.summaryItem}>
              {STUDY_STATUS_LABELS[status]} {countBy(words, 'quizStatus', status)}
            </span>
          ))}
        </div>
        <div className={styles.summaryGroup}>
          <span className={styles.summaryTitle}>スター</span>
          <span className={styles.summaryItem}>
            スター付き {words.filter((w) => w.isStarred).length}
          </span>
          <span className={styles.summaryItem}>
            スターなし {words.filter((w) => !w.isStarred).length}
          </span>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>単語</th>
              <th>意味</th>
              <th>補足</th>
              <th>定着度</th>
              <th>フラッシュカード</th>
              <th>4択クイズ</th>
              <th>スター</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {words.map((word) => (
              <WordTableRow
                key={word.id}
                word={word}
                onUpdate={(patch) => onUpdate(word.id, patch)}
                onEdit={() => onEdit(word)}
                onDelete={() => onDelete(word)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
