import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'danger' | 'accent'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  danger: styles.danger,
  accent: styles.accent,
}

export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return <button className={[styles.button, VARIANT_CLASS[variant], className].filter(Boolean).join(' ')} {...rest} />
}
