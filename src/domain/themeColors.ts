import type { ThemeColor } from '@/types'

interface ThemeColorPreset {
  key: ThemeColor
  label: string
  /** スウォッチの背景（単色またはグラデーション） */
  swatch: string
}

export const THEME_COLOR_PRESETS: ThemeColorPreset[] = [
  { key: 'default', label: 'ブルー×グリーン', swatch: 'linear-gradient(135deg, #3d6ef0 50%, #2e8b57 50%)' },
  { key: 'blue', label: 'ブルー', swatch: '#4f6ef7' },
  { key: 'green', label: 'グリーン', swatch: '#2e8b57' },
  { key: 'warm', label: 'イエロー/オレンジ', swatch: '#d2691e' },
  { key: 'pink', label: 'ピンク/レッド', swatch: '#db7093' },
  { key: 'plain', label: '白(シンプル)', swatch: '#ffffff' },
]
