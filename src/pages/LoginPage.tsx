import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/common/Button'
import { supabase } from '@/lib/supabaseClient'
import styles from './AccountCreatePage.module.css'
import loginStyles from './LoginPage.module.css'

type Mode = 'signIn' | 'signUp'

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません'
  }
  if (message.includes('User already registered')) {
    return 'このメールアドレスは既に登録されています'
  }
  if (message.includes('Password should be at least')) {
    return 'パスワードは6文字以上で入力してください'
  }
  if (message.toLowerCase().includes('rate limit')) {
    return 'メール送信回数の上限に達しました。しばらく（1時間程度）待ってからもう一度お試しください。'
  }
  return 'エラーが発生しました。もう一度お試しください。'
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    setInfo(null)
    try {
      if (mode === 'signIn') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (!data.session) {
          setInfo('確認メールを送信しました。メール内のリンクを開いてからログインしてください。')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? translateAuthError(err.message) : 'エラーが発生しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  const isSignIn = mode === 'signIn'

  return (
    <div className="page">
      <h1 className={`${styles.title} ${loginStyles.titleRow}`}>
        <span className={loginStyles.titleIcon}>📚</span>単語帳
      </h1>
      <p className={styles.lead}>
        {isSignIn ? (
          <>
            <span className={loginStyles.underline}>ログイン</span>してはじめましょう
          </>
        ) : (
          <>
            <span className={loginStyles.underline}>新規登録</span>してはじめましょう
          </>
        )}
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>メールアドレス</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
            autoComplete="email"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>パスワード</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
            minLength={6}
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
          />
        </label>

        {error && <p className={styles.hint}>{error}</p>}
        {info && <p className={styles.label}>{info}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="submit" variant={isSignIn ? 'primary' : 'accent'} disabled={submitting}>
            {isSignIn ? 'ログイン' : '新規登録'}
          </Button>
          <Button
            type="button"
            variant={isSignIn ? 'accent' : 'primary'}
            onClick={() => {
              setMode(isSignIn ? 'signUp' : 'signIn')
              setError(null)
              setInfo(null)
            }}
          >
            {isSignIn ? '新規登録はこちら' : 'ログインはこちら'}
          </Button>
        </div>
      </form>
    </div>
  )
}
