import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { IconPicker } from '@/components/account/IconPicker'
import { ThemeColorPicker } from '@/components/account/ThemeColorPicker'
import { useAccount } from '@/context/AccountContext'
import { STATUS_MESSAGE_MAX_LENGTH, isValidNickname, isValidStatusMessage } from '@/domain/validation'
import { supabase } from '@/lib/supabaseClient'
import { updateAccount } from '@/repositories/accountRepository'
import { StorageQuotaError } from '@/repositories/storage'
import { routes } from '@/routes'
import type { IconType, ThemeColor } from '@/types'
import styles from '../pages/AccountCreatePage.module.css'

export default function AccountSettingsPage() {
  const navigate = useNavigate()
  const { account, refreshAccount } = useAccount()
  const [nickname, setNickname] = useState('')
  const [iconType, setIconType] = useState<IconType>('default')
  const [iconValue, setIconValue] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [themeColor, setThemeColor] = useState<ThemeColor>('default')
  const [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (account) {
      setNickname(account.nickname)
      setIconType(account.iconType)
      setIconValue(account.iconValue)
      setStatusMessage(account.statusMessage ?? '')
      setThemeColor(account.themeColor)
    }
  }, [account])

  const nicknameValid = isValidNickname(nickname)
  const statusMessageValid = isValidStatusMessage(statusMessage)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nicknameValid || !statusMessageValid || submitting) return
    setSubmitting(true)
    setSaveError(null)
    try {
      const trimmedStatusMessage = statusMessage.trim()
      await updateAccount({
        nickname: nickname.trim(),
        iconType,
        iconValue,
        statusMessage: trimmedStatusMessage === '' ? null : trimmedStatusMessage,
        themeColor,
      })
      await refreshAccount()
      navigate(routes.top)
    } catch (err) {
      setSaveError(err instanceof StorageQuotaError ? err.message : '保存に失敗しました。もう一度お試しください。')
      setSubmitting(false)
    }
  }

  if (!account) return null

  return (
    <div className="page">
      <h1 className={styles.title}>アカウント設定</h1>
      <p className={styles.lead}>ニックネーム・アイコンを変更できます</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>ニックネーム</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={styles.input}
            maxLength={40}
          />
          {!nicknameValid && nickname.length > 0 && (
            <span className={styles.hint}>1〜20文字で入力してください</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>ひとこと</span>
          <input
            type="text"
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            className={styles.input}
            placeholder="例）英検準1級を目指して勉強中！"
            maxLength={STATUS_MESSAGE_MAX_LENGTH}
          />
          <span className={styles.subHint}>任意項目です。フレンド一覧に表示されます。</span>
        </label>

        <div className={styles.field}>
          <span className={styles.label}>アイコン</span>
          <IconPicker
            iconType={iconType}
            iconValue={iconValue}
            onChange={(type, value) => {
              setIconType(type)
              setIconValue(value)
            }}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>テーマカラー</span>
          <ThemeColorPicker value={themeColor} onChange={setThemeColor} />
          <span className={styles.subHint}>保存すると画面全体の配色が切り替わります。</span>
        </div>

        {saveError && <p className={styles.hint}>{saveError}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="submit" disabled={!nicknameValid || !statusMessageValid || submitting}>
            💾 保存する
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(routes.top)}>
            ← 戻る
          </Button>
        </div>
      </form>

      <div style={{ marginTop: 32 }}>
        <Button type="button" variant="danger" onClick={() => supabase.auth.signOut()}>
          🚪 ログアウト
        </Button>
      </div>
    </div>
  )
}
