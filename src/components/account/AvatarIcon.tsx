import { getPresetEmoji } from '@/domain/iconPresets'
import type { IconType } from '@/types'
import styles from './AvatarIcon.module.css'

interface AvatarIconProps {
  iconType: IconType
  iconValue: string | null
  size?: number
}

export function AvatarIcon({ iconType, iconValue, size = 48 }: AvatarIconProps) {
  const style = { width: size, height: size, fontSize: size * 0.55 }

  if (iconType === 'custom' && iconValue) {
    return (
      <img
        src={iconValue}
        alt="アイコン"
        className={styles.avatar}
        style={style}
      />
    )
  }

  if (iconType === 'preset' && iconValue) {
    return (
      <div className={styles.avatar} style={style}>
        {getPresetEmoji(iconValue)}
      </div>
    )
  }

  return (
    <div className={`${styles.avatar} ${styles.default}`} style={style}>
      👤
    </div>
  )
}
