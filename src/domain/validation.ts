const NICKNAME_MIN_LENGTH = 1
const NICKNAME_MAX_LENGTH = 20
export const STATUS_MESSAGE_MAX_LENGTH = 40

function codePointLength(value: string): number {
  return [...value].length
}

export function isValidNickname(value: string): boolean {
  const length = codePointLength(value.trim())
  return length >= NICKNAME_MIN_LENGTH && length <= NICKNAME_MAX_LENGTH
}

/** 任意項目のため空文字は許容し、上限文字数のみチェックする */
export function isValidStatusMessage(value: string): boolean {
  return codePointLength(value.trim()) <= STATUS_MESSAGE_MAX_LENGTH
}

export function isValidWordEntry(word: string, meaning: string): boolean {
  return word.trim().length > 0 && meaning.trim().length > 0
}
