import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import styles from './TanchouFormDialog.module.css'

interface TanchouFormDialogProps {
  title: string
  initialName?: string
  onSubmit: (name: string) => void
  onClose: () => void
}

export function TanchouFormDialog({ title, initialName = '', onSubmit, onClose }: TanchouFormDialogProps) {
  const [name, setName] = useState(initialName)
  const valid = name.trim().length > 0

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return
    onSubmit(name.trim())
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="単語帳の名前"
          className={styles.input}
          autoFocus
        />
        <div className={styles.actions}>
          <Button type="submit" disabled={!valid}>
            保存する
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
        </div>
      </form>
    </Modal>
  )
}
