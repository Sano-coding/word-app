import bearIcon from '@/assets/icons/bear.jpg'
import catIcon from '@/assets/icons/cat.jpg'
import catSiameseIcon from '@/assets/icons/cat-siamese.jpg'
import dogIcon from '@/assets/icons/dog.jpg'
import foxIcon from '@/assets/icons/fox.jpg'
import koalaIcon from '@/assets/icons/koala.jpg'
import pandaIcon from '@/assets/icons/panda.jpg'
import penguinIcon from '@/assets/icons/penguin.jpg'
import rabbitIcon from '@/assets/icons/rabbit.jpg'

export const PRESET_ICONS = [
  { key: 'dog', label: '犬', image: dogIcon },
  { key: 'cat', label: '猫', image: catIcon },
  { key: 'cat-siamese', label: 'シャム猫', image: catSiameseIcon },
  { key: 'rabbit', label: 'うさぎ', image: rabbitIcon },
  { key: 'bear', label: '熊', image: bearIcon },
  { key: 'panda', label: 'パンダ', image: pandaIcon },
  { key: 'fox', label: '狐', image: foxIcon },
  { key: 'koala', label: 'コアラ', image: koalaIcon },
  { key: 'penguin', label: 'ペンギン', image: penguinIcon },
] as const

export function getPresetImage(key: string): string | null {
  return PRESET_ICONS.find((icon) => icon.key === key)?.image ?? null
}
