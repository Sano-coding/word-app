import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { isValidWordEntry } from '@/domain/validation'
import type { Word } from '@/types'
import styles from './WordFormModal.module.css'

interface WordFormModalProps {
  mode: 'create' | 'edit'
  initialWord?: Word
  /** 保存対象の単語が既存の別レコードと重複するかを判定する */
  onCheckDuplicate: (word: string) => Word | undefined
  /** overwriteId が渡された場合、そのレコードの意味を上書き更新する（定着度・出題状況は保持） */
  onSubmit: (input: { word: string; meaning: string }, overwriteId?: string) => void
  onClose: () => void
}

export function WordFormModal({ mode, initialWord, onCheckDuplicate, onSubmit, onClose }: WordFormModalProps) {
  const [word, setWord] = useState(initialWord?.word ?? '')
  const [meaning, setMeaning] = useState(initialWord?.meaning ?? '')
  const [pendingDuplicate, setPendingDuplicate] = useState<Word | null>(null)

  const valid = isValidWordEntry(word, meaning)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return

    const trimmedWord = word.trim()
    const duplicate = onCheckDuplicate(trimmedWord)
    const isSameRecord = duplicate && initialWord && duplicate.id === initialWord.id
    if (duplicate && !isSameRecord) {
      setPendingDuplicate(duplicate)
      return
    }
    onSubmit({ word: trimmedWord, meaning: meaning.trim() })
  }

  if (pendingDuplicate) {
    return (
      <Modal title="重複する単語があります" onClose={onClose}>
        <p className={styles.message}>
          「{pendingDuplicate.word}」は既に登録されています。意味を上書きしますか？
          （定着度・出題状況は変更されません）
        </p>
        <div className={styles.actions}>
          <Button
            onClick={() => {
              onSubmit({ word: word.trim(), meaning: meaning.trim() }, pendingDuplicate.id)
            }}
          >
            上書きする
          </Button>
          <Button variant="secondary" onClick={() => setPendingDuplicate(null)}>
            キャンセル
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={mode === 'create' ? '単語を登録' : '単語を編集'} onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>単語</span>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className={styles.input}
            autoFocus
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>意味</span>
          <input
            type="text"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            className={styles.input}
          />
        </label>
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
