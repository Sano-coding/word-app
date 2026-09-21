import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { ConfirmDeleteDialog } from '@/components/tanchou/ConfirmDeleteDialog'
import { CsvImportModal } from '@/components/word/CsvImportModal'
import { WordFormModal } from '@/components/word/WordFormModal'
import { WordTable } from '@/components/word/WordTable'
import { getTanchou } from '@/repositories/tanchouRepository'
import { bulkImportWords, createWord, deleteWord, listWords, updateWord } from '@/repositories/wordRepository'
import { routes } from '@/routes'
import type { Tanchou, Word } from '@/types'
import styles from './WordListPage.module.css'

export default function WordListPage() {
  const { tanchouId } = useParams<{ tanchouId: string }>()
  const navigate = useNavigate()
  const [tanchou, setTanchou] = useState<Tanchou | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [formState, setFormState] = useState<{ mode: 'create' | 'edit'; word?: Word } | null>(null)
  const [deletingWord, setDeletingWord] = useState<Word | null>(null)
  const [importing, setImporting] = useState(false)

  const refresh = useCallback(async () => {
    if (!tanchouId) return
    setTanchou(await getTanchou(tanchouId))
    setWords(await listWords(tanchouId))
  }, [tanchouId])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!tanchouId || !tanchou) return null

  return (
    <div className="page">
      <Button variant="secondary" onClick={() => navigate(routes.submenu(tanchouId))}>
        ← サブメニューへ
      </Button>

      <div className={styles.headerRow}>
        <h1 className={styles.title}>{tanchou.name}</h1>
        <div className={styles.headerActions}>
          <Button onClick={() => setFormState({ mode: 'create' })}>+ 単語を登録</Button>
          <Button variant="secondary" onClick={() => setImporting(true)}>
            CSVインポート
          </Button>
        </div>
      </div>

      {words.length === 0 ? (
        <p className={styles.empty}>まだ単語が登録されていません。</p>
      ) : (
        <WordTable
          words={words}
          onUpdate={async (id, patch) => {
            await updateWord(id, patch)
            await refresh()
          }}
          onEdit={(word) => setFormState({ mode: 'edit', word })}
          onDelete={(word) => setDeletingWord(word)}
        />
      )}

      {formState && (
        <WordFormModal
          mode={formState.mode}
          initialWord={formState.word}
          onClose={() => setFormState(null)}
          onCheckDuplicate={(word) => words.find((w) => w.word === word)}
          onSubmit={async (input, overwriteId) => {
            if (overwriteId) {
              await updateWord(overwriteId, { meaning: input.meaning })
            } else if (formState.mode === 'create') {
              await createWord(tanchouId, input)
            } else if (formState.word) {
              await updateWord(formState.word.id, input)
            }
            setFormState(null)
            await refresh()
          }}
        />
      )}

      {deletingWord && (
        <ConfirmDeleteDialog
          title="単語を削除"
          message={`「${deletingWord.word}」を削除します。この操作は取り消せません。よろしいですか？`}
          onClose={() => setDeletingWord(null)}
          onConfirm={async () => {
            await deleteWord(deletingWord.id)
            setDeletingWord(null)
            await refresh()
          }}
        />
      )}

      {importing && (
        <CsvImportModal
          existingWords={words}
          onClose={() => setImporting(false)}
          onImport={async (plan) => {
            await bulkImportWords(tanchouId, plan)
            await refresh()
          }}
        />
      )}
    </div>
  )
}
