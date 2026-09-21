import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  const variantClass = variant === 'primary' ? styles.primary : variant === 'danger' ? styles.danger : styles.secondary
  return <button className={[styles.button, variantClass, className].filter(Boolean).join(' ')} {...rest} />
}
