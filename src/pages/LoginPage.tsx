import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/common/Button'
import { supabase } from '@/lib/supabaseClient'
import styles from './AccountCreatePage.module.css'
import loginStyles from './LoginPage.module.css'

type Mode = 'signIn' | 'signUp'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3277-1.5831-5.0359-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
      <path fill="#FBBC05" d="M3.9641 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1731 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9641 10.71z" />
      <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4404 1.3459l2.5818-2.5818C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9641 7.29C4.6723 5.1627 6.6559 3.5795 9 3.5795z" />
    </svg>
  )
}

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

  async function handleGoogleLogin() {
    setError(null)
    setInfo(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
    })
    if (error) setError(translateAuthError(error.message))
  }

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
            {isSignIn ? '🔑 ログイン' : '📝 新規登録'}
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
            {isSignIn ? '📝 新規登録はこちら' : '🔑 ログインはこちら'}
          </Button>
        </div>
      </form>

      <div className={loginStyles.divider}>
        <span>または</span>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={handleGoogleLogin}
        disabled={submitting}
        className={loginStyles.googleButton}
      >
        <GoogleIcon />
        Googleで続ける
      </Button>
    </div>
  )
}
