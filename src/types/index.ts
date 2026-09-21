export type IconType = 'default' | 'preset' | 'custom'

export interface Account {
  id: string
  nickname: string
  iconType: IconType
  /** preset の場合はプリセットキー、custom の場合は圧縮済み画像の dataURL */
  iconValue: string | null
  createdAt: string
}

export interface Tanchou {
  id: string
  accountId: string
  name: string
  isStarred: boolean
  createdAt: string
  /** 将来の共有機能（全体公開／フレンド公開）を見据えた予約フィールド。現状は常に 'private' で、UI には一切出さない */
  visibility: 'private'
}

export type MasteryLevel = 'not_memorized' | 'partially_memorized' | 'memorized'
export type StudyStatus = 'not_shown' | 'shown'

export interface Word {
  id: string
  tanchouId: string
  word: string
  meaning: string
  /** 補足。空文字列は「補足なし」を表す（任意項目） */
  note: string
  masteryLevel: MasteryLevel
  flashcardStatus: StudyStatus
  quizStatus: StudyStatus
  isStarred: boolean
  createdAt: string
}

export type NewWordInput = Pick<Word, 'word' | 'meaning'> & { note?: string }
