import { THEME_COLOR_PRESETS } from '@/domain/themeColors'
import type { ThemeColor } from '@/types'
import styles from './ThemeColorPicker.module.css'

interface ThemeColorPickerProps {
  value: ThemeColor
  onChange: (value: ThemeColor) => void
}

export function ThemeColorPicker({ value, onChange }: ThemeColorPickerProps) {
  return (
    <div className={styles.row}>
      {THEME_COLOR_PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          className={`${styles.swatch} ${value === preset.key ? styles.selected : ''}`}
          style={{ background: preset.swatch }}
          onClick={() => onChange(preset.key)}
          aria-label={preset.label}
          aria-pressed={value === preset.key}
          title={preset.label}
        >
          {value === preset.key && <span className={styles.check}>✓</span>}
        </button>
      ))}
    </div>
  )
}
