import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import styles from './ConfirmDeleteDialog.module.css'

interface ConfirmDeleteDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDeleteDialog({ title, message, onConfirm, onClose }: ConfirmDeleteDialogProps) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button variant="danger" onClick={onConfirm}>
          削除する
        </Button>
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
      </div>
    </Modal>
  )
}
