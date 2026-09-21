import { useNavigate } from 'react-router-dom'
import { routes } from '@/routes'
import styles from './HomePage.module.css'

const UPDATES = [
  '単語・単語帳に⭐スター機能を追加しました',
  'サイドバーから直接フラッシュカード・4択クイズを始められるようになりました',
]

const TUTORIAL_ITEMS = [
  {
    icon: '📚',
    text: '「単語帳」から覚えたい単語とその意味を登録しよう！',
    subText: '単語リストの単語を押すと意味と補足を編集できるよ',
    path: routes.top,
  },
  {
    icon: '🃏',
    text: '「フラッシュカード」で単語の意味と定着度を確認しよう！',
    path: routes.flashcardHub,
  },
  {
    icon: '❓',
    text: '「４択クイズ」で効率よく単語の意味を覚えよう！',
    path: routes.quizHub,
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <h1 className={styles.title}>ホーム</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>アップデートのお知らせ</h2>
        <ul className={styles.updateList}>
          {UPDATES.map((update) => (
            <li key={update}>{update}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>使い方</h2>
        <div className={styles.tutorialList}>
          {TUTORIAL_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className={styles.tutorialItem}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.tutorialIcon}>{item.icon}</span>
              <span className={styles.tutorialTextGroup}>
                <span>{item.text}</span>
                {item.subText && <span className={styles.tutorialSubText}>{item.subText}</span>}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
