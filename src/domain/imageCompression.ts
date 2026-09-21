const MAX_DIMENSION = 256
const QUALITY = 0.8

export function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('画像の読み込みに失敗しました'))
    }
    img.src = objectUrl
  })
}

export function resizeAndCompress(img: HTMLImageElement): string {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('画像の圧縮に失敗しました')
  }
  ctx.drawImage(img, 0, 0, width, height)

  const webp = canvas.toDataURL('image/webp', QUALITY)
  if (webp.startsWith('data:image/webp')) {
    return webp
  }
  return canvas.toDataURL('image/jpeg', QUALITY)
}

export async function compressImageFile(file: File): Promise<string> {
  const img = await fileToImage(file)
  return resizeAndCompress(img)
}
