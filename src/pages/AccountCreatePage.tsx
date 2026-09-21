import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { IconPicker } from '@/components/account/IconPicker'
import { useAccount } from '@/context/AccountContext'
import { isValidNickname } from '@/domain/validation'
import { createAccount } from '@/repositories/accountRepository'
import { StorageQuotaError } from '@/repositories/storage'
import { routes } from '@/routes'
import type { IconType } from '@/types'
import styles from './AccountCreatePage.module.css'

export default function AccountCreatePage() {
  const navigate = useNavigate()
  const { refreshAccount } = useAccount()
  const [nickname, setNickname] = useState('')
  const [iconType, setIconType] = useState<IconType>('default')
  const [iconValue, setIconValue] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const nicknameValid = isValidNickname(nickname)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nicknameValid || submitting) return
    setSubmitting(true)
    setSaveError(null)
    try {
      await createAccount({ nickname: nickname.trim(), iconType, iconValue })
      await refreshAccount()
      navigate(routes.top, { replace: true })
    } catch (err) {
      setSaveError(err instanceof StorageQuotaError ? err.message : '保存に失敗しました。もう一度お試しください。')
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h1 className={styles.title}>単語帳へようこそ</h1>
      <p className={styles.lead}>ニックネームとアイコンを設定してはじめましょう</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>ニックネーム</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="例）たなか"
            className={styles.input}
            maxLength={40}
          />
          {!nicknameValid && nickname.length > 0 && (
            <span className={styles.hint}>1〜20文字で入力してください</span>
          )}
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

        {saveError && <p className={styles.hint}>{saveError}</p>}

        <Button type="submit" disabled={!nicknameValid || submitting}>
          はじめる
        </Button>
      </form>
    </div>
  )
}
