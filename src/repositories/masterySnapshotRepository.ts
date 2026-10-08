import { supabase } from '@/lib/supabaseClient'
import type { MasterySnapshot } from '@/types'

interface MasterySnapshotRow {
  snapshot_date: string
  not_memorized_count: number
  partially_memorized_count: number
  memorized_count: number
}

function toMasterySnapshot(row: MasterySnapshotRow): MasterySnapshot {
  return {
    date: row.snapshot_date,
    notMemorized: row.not_memorized_count,
    partiallyMemorized: row.partially_memorized_count,
    memorized: row.memorized_count,
  }
}

/** 日付昇順（古い→新しい）でスナップショット履歴を返す */
export async function listMasterySnapshots(accountId: string): Promise<MasterySnapshot[]> {
  const { data, error } = await supabase
    .from('mastery_snapshots')
    .select('snapshot_date, not_memorized_count, partially_memorized_count, memorized_count')
    .eq('account_id', accountId)
    .order('snapshot_date', { ascending: true })
  if (error) {
    throw error
  }
  return (data ?? []).map(toMasterySnapshot)
}
