const NICKNAME_MIN_LENGTH = 1
const NICKNAME_MAX_LENGTH = 20

function codePointLength(value: string): number {
  return [...value].length
}

export function isValidNickname(value: string): boolean {
  const length = codePointLength(value.trim())
  return length >= NICKNAME_MIN_LENGTH && length <= NICKNAME_MAX_LENGTH
}

export function isValidWordEntry(word: string, meaning: string): boolean {
  return word.trim().length > 0 && meaning.trim().length > 0
}
