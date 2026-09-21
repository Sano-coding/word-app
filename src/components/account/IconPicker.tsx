import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { compressImageFile } from '@/domain/imageCompression'
import { PRESET_ICONS } from '@/domain/iconPresets'
import type { IconType } from '@/types'
import { AvatarIcon } from './AvatarIcon'
import styles from './IconPicker.module.css'

interface IconPickerProps {
  iconType: IconType
  iconValue: string | null
  onChange: (iconType: IconType, iconValue: string | null) => void
}

export function IconPicker({ iconType, iconValue, onChange }: IconPickerProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const dataUrl = await compressImageFile(file)
      onChange('custom', dataUrl)
    } catch {
      setError('画像の読み込みに失敗しました。別の画像でお試しください。')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={styles.picker}>
      <div className={styles.preview}>
        <AvatarIcon iconType={iconType} iconValue={iconValue} size={72} />
      </div>

      <div className={styles.options}>
        <button
          type="button"
          className={`${styles.optionButton} ${iconType === 'default' ? styles.selected : ''}`}
          onClick={() => onChange('default', null)}
        >
          デフォルトのまま
        </button>

        <button
          type="button"
          className={`${styles.optionButton} ${iconType === 'custom' ? styles.selected : ''}`}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'アップロード中…' : 'カメラロールから選ぶ'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleFileSelect}
        />
      </div>

      <div className={styles.presetGrid}>
        {PRESET_ICONS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            className={`${styles.presetButton} ${
              iconType === 'preset' && iconValue === preset.key ? styles.selected : ''
            }`}
            onClick={() => onChange('preset', preset.key)}
            aria-label={preset.key}
          >
            {preset.emoji}
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
