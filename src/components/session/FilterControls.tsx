import {
  MASTERY_LEVELS,
  MASTERY_LEVEL_ICONS,
  MASTERY_LEVEL_LABELS,
  STARRED_ICON,
  STUDY_STATUSES,
  STUDY_STATUS_LABELS,
} from '@/domain/labels'
import type { MasteryLevel, StudyStatus } from '@/types'
import styles from './FilterControls.module.css'

interface FilterControlsProps {
  statusLabel: string
  masteryLevels: MasteryLevel[]
  onMasteryLevelsChange: (levels: MasteryLevel[]) => void
  statuses: StudyStatus[]
  onStatusesChange: (statuses: StudyStatus[]) => void
  starredOnly: boolean
  onStarredOnlyChange: (value: boolean) => void
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function FilterControls({
  statusLabel,
  masteryLevels,
  onMasteryLevelsChange,
  statuses,
  onStatusesChange,
  starredOnly,
  onStarredOnlyChange,
}: FilterControlsProps) {
  return (
    <div className={styles.wrap}>
      <fieldset className={styles.group}>
        <legend>定着度で絞り込み</legend>
        <div className={styles.optionRow}>
          {MASTERY_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={`${styles.optionButton} ${masteryLevels.includes(level) ? styles.optionButtonSelected : ''}`}
              onClick={() => onMasteryLevelsChange(toggle(masteryLevels, level))}
              aria-pressed={masteryLevels.includes(level)}
            >
              <span className={styles.optionIcon}>{MASTERY_LEVEL_ICONS[level]}</span>
              {MASTERY_LEVEL_LABELS[level]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>スターで絞り込み</legend>
        <div className={styles.optionRow}>
          <button
            type="button"
            className={`${styles.optionButton} ${starredOnly ? styles.optionButtonSelected : ''}`}
            onClick={() => onStarredOnlyChange(!starredOnly)}
            aria-pressed={starredOnly}
          >
            <span className={styles.optionIcon}>{STARRED_ICON}</span>
            スター付きのみ表示
          </button>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>{statusLabel}で絞り込み</legend>
        <div className={styles.optionRow}>
          {STUDY_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={`${styles.optionButton} ${statuses.includes(status) ? styles.optionButtonSelected : ''}`}
              onClick={() => onStatusesChange(toggle(statuses, status))}
              aria-pressed={statuses.includes(status)}
            >
              {STUDY_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
