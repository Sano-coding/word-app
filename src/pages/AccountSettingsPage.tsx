import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { IconPicker } from '@/components/account/IconPicker'
import { useAccount } from '@/context/AccountContext'
import { isValidNickname } from '@/domain/validation'
import { updateAccount } from '@/repositories/accountRepository'
import { routes } from '@/routes'
import type { IconType } from '@/types'
import styles from '../pages/AccountCreatePage.module.css'

export default function AccountSettingsPage() {
  const navigate = useNavigate()
  const { account, refreshAccount } = useAccount()
  const [nickname, setNickname] = useState('')
  const [iconType, setIconType] = useState<IconType>('default')
  const [iconValue, setIconValue] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (account) {
      setNickname(account.nickname)
      setIconType(account.iconType)
      setIconValue(account.iconValue)
    }
  }, [account])

  const nicknameValid = isValidNickname(nickname)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nicknameValid || submitting) return
    setSubmitting(true)
    await updateAccount({ nickname: nickname.trim(), iconType, iconValue })
    await refreshAccount()
    navigate(routes.top)
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

        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="submit" disabled={!nicknameValid || submitting}>
            保存する
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(routes.top)}>
            戻る
          </Button>
        </div>
      </form>
    </div>
  )
}
