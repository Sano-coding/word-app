import { supabase } from '@/lib/supabaseClient'
import { notifyDataChanged } from './events'
import { listTanchous } from './tanchouRepository'
import type { LocalBackup } from './localBackup'

/** ローカルストレージ（旧版）に残っている単語帳・単語を、現在ログイン中のアカウントへ丸ごと複製する */
export async function migrateLocalDataToCloud(accountId: string, backup: LocalBackup): Promise<void> {
  const orderedTanchous = [...backup.tanchous].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const existing = await listTanchous(accountId)
  const startOrder = existing.length > 0 ? Math.max(...existing.map((t) => t.sortOrder)) + 1 : 0

  for (const [index, tanchou] of orderedTanchous.entries()) {
    const { data: tanchouRow, error: tanchouError } = await supabase
      .from('tanchous')
      .insert({
        account_id: accountId,
        name: tanchou.name,
        is_starred: tanchou.isStarred,
        visibility: 'private',
        sort_order: startOrder + index,
      })
      .select()
      .single()
    if (tanchouError) {
      throw tanchouError
    }

    const words = backup.words.filter((w) => w.tanchouId === tanchou.id)
    if (words.length === 0) continue

    const rows = words.map((w) => ({
      tanchou_id: tanchouRow.id,
      word: w.word,
      meaning: w.meaning,
      note: w.note,
      mastery_level: w.masteryLevel,
      flashcard_status: w.flashcardStatus,
      quiz_status: w.quizStatus,
      is_starred: w.isStarred,
    }))
    const { error: wordsError } = await supabase.from('words').insert(rows)
    if (wordsError) {
      throw wordsError
    }
  }
  notifyDataChanged()
}
