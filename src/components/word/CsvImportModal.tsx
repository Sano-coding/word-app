import { useState } from 'react'
import type { DragEvent } from 'react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { buildImportPlan, dedupePreview, parseCsv, validateRows } from '@/domain/csv'
import type { DedupeResult, DuplicatePolicy, CsvParseError, ImportPlan } from '@/domain/csv'
import { StorageQuotaError } from '@/repositories/storage'
import type { Word } from '@/types'
import styles from './CsvImportModal.module.css'

interface CsvImportModalProps {
  existingWords: Word[]
  onImport: (plan: ImportPlan) => Promise<void>
  onClose: () => void
}

export function CsvImportModal({ existingWords, onImport, onClose }: CsvImportModalProps) {
  const [dedupeResult, setDedupeResult] = useState<DedupeResult | null>(null)
  const [errorRows, setErrorRows] = useState<CsvParseError[]>([])
  const [policy, setPolicy] = useState<DuplicatePolicy>('keep_existing')
  const [importing, setImporting] = useState(false)
  const [readError, setReadError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setReadError(null)
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      const { valid, errorRows: invalidRows } = validateRows(rows)
      setErrorRows(invalidRows)
      setDedupeResult(dedupePreview(valid, existingWords))
    } catch {
      setReadError('ファイルの読み込みに失敗しました')
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  async function handleCommit() {
    if (!dedupeResult) return
    setImporting(true)
    setReadError(null)
    try {
      await onImport(buildImportPlan(dedupeResult, policy))
      onClose()
    } catch (err) {
      setReadError(err instanceof StorageQuotaError ? err.message : 'インポートに失敗しました。もう一度お試しください。')
      setImporting(false)
    }
  }

  return (
    <Modal title="CSVインポート" onClose={onClose}>
      {!dedupeResult && (
        <div
          className={styles.dropzone}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <p>「単語,意味,補足」の2〜3列・ヘッダー行ありのCSVファイルを選択してください（補足列は省略可）</p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
          {readError && <p className={styles.error}>{readError}</p>}
        </div>
      )}

      {dedupeResult && (
        <div className={styles.preview}>
          <ul className={styles.summaryList}>
            <li>取り込み件数: {dedupeResult.toCreate.length + dedupeResult.toUpdate.length}件</li>
            <li>重複語: {dedupeResult.duplicateCount}件</li>
            <li>エラー行: {errorRows.length}件</li>
          </ul>

          {errorRows.length > 0 && (
            <p className={styles.errorNote}>
              形式が正しくない行はスキップされます（{errorRows.map((e) => `${e.rowIndex}行目`).join('、')}）
            </p>
          )}

          {dedupeResult.toUpdate.length > 0 && (
            <fieldset className={styles.policy}>
              <legend>重複語の扱い</legend>
              <label className={styles.policyOption}>
                <input
                  type="radio"
                  checked={policy === 'keep_existing'}
                  onChange={() => setPolicy('keep_existing')}
                />
                既存の意味・補足をそのまま残す
              </label>
              <label className={styles.policyOption}>
                <input
                  type="radio"
                  checked={policy === 'overwrite'}
                  onChange={() => setPolicy('overwrite')}
                />
                インポートデータの意味・補足で上書きする
              </label>
            </fieldset>
          )}

          {readError && <p className={styles.error}>{readError}</p>}

          <div className={styles.actions}>
            <Button onClick={handleCommit} disabled={importing}>
              インポート実行
            </Button>
            <Button variant="secondary" onClick={() => setDedupeResult(null)} disabled={importing}>
              やり直す
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
