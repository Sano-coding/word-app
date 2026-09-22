import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { useAccount } from '@/context/AccountContext'
import { hasUnmigratedLocalData, markLocalDataMigrated, readLocalBackup } from '@/repositories/localBackup'
import { migrateLocalDataToCloud } from '@/repositories/migration'
import styles from './LocalDataMigrationBanner.module.css'

export function LocalDataMigrationBanner() {
  const { account } = useAccount()
  const [visible, setVisible] = useState(() => hasUnmigratedLocalData())
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!visible || !account) return null

  const backup = readLocalBackup()
  const wordCount = backup.words.length

  async function handleUpload() {
    if (!account) return
    setUploading(true)
    setError(null)
    try {
      await migrateLocalDataToCloud(account.id, backup)
      markLocalDataMigrated()
      setVisible(false)
    } catch {
      setError('アップロードに失敗しました。通信状況を確認してもう一度お試しください。')
      setUploading(false)
    }
  }

  function handleSkip() {
    markLocalDataMigrated()
    setVisible(false)
  }

  return (
    <div className={styles.banner}>
      <p className={styles.text}>
        この端末にこれまで保存されていた単語帳（単語帳{backup.tanchous.length}冊・単語{wordCount}語）が見つかりました。
        クラウドにアップロードすると、他の端末（スマホなど）からも同じ単語帳が使えるようになります。
      </p>
      <div className={styles.actions}>
        <Button type="button" onClick={handleUpload} disabled={uploading}>
          {uploading ? 'アップロード中…' : 'アップロードする'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleSkip} disabled={uploading}>
          しない
        </Button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
