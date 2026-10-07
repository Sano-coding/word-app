import { STAR_FILTERS, STAR_FILTER_ICONS, STAR_FILTER_LABELS } from '@/domain/tanchouFilter'
import type { StarFilter } from '@/domain/tanchouFilter'
import styles from './StarFilterChips.module.css'

interface StarFilterChipsProps {
  value: StarFilter
  counts: Record<StarFilter, number>
  onChange: (value: StarFilter) => void
}

export function StarFilterChips({ value, counts, onChange }: StarFilterChipsProps) {
  return (
    <div className={styles.row} role="group" aria-label="スターで絞り込み">
      {STAR_FILTERS.map((filter) => {
        const icon = STAR_FILTER_ICONS[filter]
        const selected = value === filter
        return (
          <button
            key={filter}
            type="button"
            className={`${styles.chip} ${selected ? styles.chipSelected : ''}`}
            onClick={() => onChange(filter)}
            aria-pressed={selected}
          >
            {icon && <span className={styles.chipIcon}>{icon}</span>}
            {STAR_FILTER_LABELS[filter]}
            <span className={styles.chipCount}>{counts[filter]}</span>
          </button>
        )
      })}
    </div>
  )
}
