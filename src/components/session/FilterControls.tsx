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
        {MASTERY_LEVELS.map((level) => (
          <label key={level} className={styles.option}>
            <input
              type="checkbox"
              checked={masteryLevels.includes(level)}
              onChange={() => onMasteryLevelsChange(toggle(masteryLevels, level))}
            />
            <span className={styles.optionIcon}>{MASTERY_LEVEL_ICONS[level]}</span>
            {MASTERY_LEVEL_LABELS[level]}
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <legend>スターで絞り込み</legend>
        <label className={styles.option}>
          <input
            type="checkbox"
            checked={starredOnly}
            onChange={(e) => onStarredOnlyChange(e.target.checked)}
          />
          <span className={styles.optionIcon}>{STARRED_ICON}</span>
          スター付きのみ表示
        </label>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>{statusLabel}で絞り込み</legend>
        {STUDY_STATUSES.map((status) => (
          <label key={status} className={styles.option}>
            <input
              type="checkbox"
              checked={statuses.includes(status)}
              onChange={() => onStatusesChange(toggle(statuses, status))}
            />
            {STUDY_STATUS_LABELS[status]}
          </label>
        ))}
      </fieldset>
    </div>
  )
}
