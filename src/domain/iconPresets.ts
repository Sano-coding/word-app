export const PRESET_ICONS = [
  { key: 'dog', emoji: '🐶' },
  { key: 'cat', emoji: '🐱' },
  { key: 'rabbit', emoji: '🐰' },
  { key: 'bear', emoji: '🐻' },
  { key: 'panda', emoji: '🐼' },
  { key: 'fox', emoji: '🦊' },
  { key: 'koala', emoji: '🐨' },
  { key: 'penguin', emoji: '🐧' },
] as const

export function getPresetEmoji(key: string): string {
  return PRESET_ICONS.find((icon) => icon.key === key)?.emoji ?? '❓'
}
