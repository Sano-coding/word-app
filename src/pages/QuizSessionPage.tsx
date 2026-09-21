import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { ProgressIndicator } from '@/components/session/ProgressIndicator'
import { StarButton } from '@/components/session/StarButton'
import { MASTERY_LEVEL_LABELS } from '@/domain/labels'
import { applyQuizAnswer } from '@/domain/masteryLevel'
import { evaluateQuizAnswer, generateChoices } from '@/domain/quizLogic'
import type { QuizChoice } from '@/domain/quizLogic'
import type { FilterSnapshot } from '@/domain/sessionQueue'
import { listWords, updateWord } from '@/repositories/wordRepository'
import { routes } from '@/routes'
import type { MasteryLevel, Word } from '@/types'
import styles from './QuizSessionPage.module.css'

interface SessionState {
  queue: Word[]
  filterSnapshot: FilterSnapshot
}

export interface QuizAnswerLogEntry {
  wordId: string
  word: string
  correct: boolean
  selectedMeaning: string
  correctMeaning: string
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
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; newMasteryLevel: MasteryLevel } | null>(null)
  const [starOverrides, setStarOverrides] = useState<Record<string, boolean>>({})

  const hasQueue = !!state && state.queue.length > 0

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

  const choices = useMemo<QuizChoice[]>(() => {
    if (!currentWord || !allWords) return []
    return generateChoices(currentWord, allWords)
  }, [currentWord, allWords])

  if (!tanchouId || !hasQueue || !currentWord || !allWords) return null

  const { queue, filterSnapshot } = state!
  const isLast = currentIndex === queue.length - 1
  const isStarred = starOverrides[currentWord.id] ?? currentWord.isStarred

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
        word: currentWord!.word,
        correct: isCorrect,
        selectedMeaning: choice.meaning,
        correctMeaning: currentWord!.meaning,
      },
    ])
    setLastResult({ isCorrect, newMasteryLevel })
    setPhase('feedback')
  }

  function handleNext() {
    if (isLast) {
      navigate(routes.quizSummary(tanchouId!), {
        replace: true,
        state: { answerLog, wordIds: queue.map((w) => w.id), filterSnapshot },
      })
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
        <StarButton isStarred={isStarred} onToggle={handleToggleStar} />
      </div>

      {phase === 'question' && (
        <div>
          <h1 className={styles.word}>{currentWord.word}</h1>
          <div className={styles.choices}>
            {choices.map((choice, i) => (
              <button key={i} type="button" className={styles.choiceButton} onClick={() => handleSelect(choice)}>
                {choice.meaning}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'feedback' && lastResult && (
        <div>
          <p className={lastResult.isCorrect ? styles.correct : styles.incorrect}>
            {lastResult.isCorrect ? '正解！' : '不正解'}
          </p>
          <ul className={styles.choiceResultList}>
            {choices.map((choice, i) => (
              <li key={i} className={choice.isCorrect ? styles.correctRow : undefined}>
                {choice.meaning} - {choice.word.word}
              </li>
            ))}
          </ul>
          <p className={styles.updatedLevel}>更新後の定着度：{MASTERY_LEVEL_LABELS[lastResult.newMasteryLevel]}</p>
          <Button onClick={handleNext}>{isLast ? '結果を見る' : '次の問題へ'}</Button>
        </div>
      )}
    </div>
  )
}
