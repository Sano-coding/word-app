import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { BottomActionBar } from '@/components/session/BottomActionBar'
import { ProgressIndicator } from '@/components/session/ProgressIndicator'
import { StarButton } from '@/components/session/StarButton'
import { MASTERY_LEVEL_ICONS, MASTERY_LEVEL_LABELS, QUIZ_MODE_LABELS } from '@/domain/labels'
import { applyQuizAnswer } from '@/domain/masteryLevel'
import { evaluateQuizAnswer, generateChoices, getQuizAnswerText, getQuizPrompt, pickQuizDirection } from '@/domain/quizLogic'
import type { QuizChoice, QuizDirection, QuizMode } from '@/domain/quizLogic'
import type { FilterSnapshot } from '@/domain/sessionQueue'
import { listWords, updateWord } from '@/repositories/wordRepository'
import { routes } from '@/routes'
import type { MasteryLevel, Word } from '@/types'
import styles from './QuizSessionPage.module.css'

interface SessionState {
  queue: Word[]
  filterSnapshot: FilterSnapshot
  /** 出題形式。履歴から戻った古いstateなど、無い場合は従来の単語→意味として扱う */
  quizMode?: QuizMode
}

export interface QuizAnswerLogEntry {
  wordId: string
  direction: QuizDirection
  /** 問題として表示した文字列（単語→意味なら単語、意味→単語なら意味） */
  prompt: string
  correct: boolean
  selectedAnswer: string
  correctAnswer: string
}

export default function QuizSessionPage() {
  const { tanchouId } = useParams<{ tanchouId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as SessionState | null

  const [allWords, setAllWords] = useState<Word[] | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<'question' | 'feedback'>('question')
  const [answerLog, setAnswerLog] = useState<QuizAnswerLogEntry[]>([])
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean
    newMasteryLevel: MasteryLevel
    selectedWordId: string
  } | null>(null)
  const [starOverrides, setStarOverrides] = useState<Record<string, boolean>>({})

  const hasQueue = !!state && state.queue.length > 0
  const quizMode: QuizMode = state?.quizMode ?? 'word_to_meaning'
  // ミックスでも描画のたびに向きが変わらないよう、セッション開始時に全問分を決めておく
  const [directions] = useState<QuizDirection[]>(() => (state?.queue ?? []).map(() => pickQuizDirection(quizMode)))

  useEffect(() => {
    if (!tanchouId) return
    listWords(tanchouId).then(setAllWords)
  }, [tanchouId])

  useEffect(() => {
    if (!hasQueue && tanchouId) {
      navigate(routes.quizFilter(tanchouId), { replace: true })
    }
  }, [hasQueue, tanchouId, navigate])

  const currentWord = hasQueue ? state!.queue[currentIndex] : null
  const direction = directions[currentIndex] ?? 'word_to_meaning'

  const choices = useMemo<QuizChoice[]>(() => {
    if (!currentWord || !allWords) return []
    return generateChoices(currentWord, allWords, direction)
  }, [currentWord, allWords, direction])

  if (!tanchouId || !hasQueue || !currentWord || !allWords) return null

  const { queue, filterSnapshot } = state!
  const isLast = currentIndex === queue.length - 1
  const isStarred = starOverrides[currentWord.id] ?? currentWord.isStarred
  const prompt = getQuizPrompt(currentWord, direction)
  const promptClass = direction === 'meaning_to_word' ? styles.meaningPrompt : styles.word
  const directionBadge = quizMode === 'mix' && <span className={styles.directionBadge}>{QUIZ_MODE_LABELS[direction]}</span>

  async function handleToggleStar() {
    const next = !isStarred
    setStarOverrides((prev) => ({ ...prev, [currentWord!.id]: next }))
    await updateWord(currentWord!.id, { isStarred: next })
  }

  async function handleSelect(choice: QuizChoice) {
    const isCorrect = evaluateQuizAnswer(choice)
    const newMasteryLevel = applyQuizAnswer(currentWord!.masteryLevel, isCorrect)
    await updateWord(currentWord!.id, { masteryLevel: newMasteryLevel, quizStatus: 'shown' })
    setAnswerLog((log) => [
      ...log,
      {
        wordId: currentWord!.id,
        direction,
        prompt,
        correct: isCorrect,
        selectedAnswer: choice.text,
        correctAnswer: getQuizAnswerText(currentWord!, direction),
      },
    ])
    setLastResult({ isCorrect, newMasteryLevel, selectedWordId: choice.word.id })
    setPhase('feedback')
  }

  function goToSummary() {
    navigate(routes.quizSummary(tanchouId!), {
      replace: true,
      state: { answerLog, wordIds: queue.map((w) => w.id), filterSnapshot, quizMode },
    })
  }

  function handleNext() {
    if (isLast) {
      goToSummary()
      return
    }
    setCurrentIndex((i) => i + 1)
    setPhase('question')
    setLastResult(null)
  }

  return (
    <div className="page">
      <div className={styles.headerRow}>
        <ProgressIndicator current={currentIndex + 1} total={queue.length} unit="問" />
        <div className={styles.headerActions}>
          <StarButton isStarred={isStarred} onToggle={handleToggleStar} />
          <Button variant="secondary" onClick={goToSummary}>
            ⏸️ 中断する
          </Button>
        </div>
      </div>

      {phase === 'question' && (
        <div>
          {directionBadge}
          {direction === 'meaning_to_word' && <p className={styles.promptLabel}>この意味の単語はどれ？</p>}
          <h1 className={promptClass}>{prompt}</h1>
          <div className={styles.choices}>
            {choices.map((choice, i) => (
              <button key={i} type="button" className={styles.choiceButton} onClick={() => handleSelect(choice)}>
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'feedback' && lastResult && (
        <div>
          {directionBadge}
          <h1 className={`${promptClass} ${styles.resultPrompt}`}>{prompt}</h1>
          <p className={lastResult.isCorrect ? styles.correct : styles.incorrect}>
            {lastResult.isCorrect ? '正解！' : '不正解'}
          </p>
          <ul className={styles.choiceResultList}>
            {choices.map((choice, i) => {
              const isSelectedWrong = !choice.isCorrect && choice.word.id === lastResult.selectedWordId
              const rowClass = choice.isCorrect ? styles.correctRow : isSelectedWrong ? styles.incorrectRow : undefined
              return (
                <li key={i} className={rowClass}>
                  {direction === 'meaning_to_word'
                    ? `${choice.word.word} - ${choice.word.meaning}`
                    : `${choice.word.meaning} - ${choice.word.word}`}
                </li>
              )
            })}
          </ul>
          <p className={styles.updatedLevel}>
            更新後の定着度：{MASTERY_LEVEL_ICONS[lastResult.newMasteryLevel]} {MASTERY_LEVEL_LABELS[lastResult.newMasteryLevel]}
          </p>
          <BottomActionBar>
            <Button onClick={handleNext}>{isLast ? '📊 結果を見る' : '▶️ 次の問題へ'}</Button>
          </BottomActionBar>
        </div>
      )}
    </div>
  )
}
