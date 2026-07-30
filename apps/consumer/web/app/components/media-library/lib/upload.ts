import { push } from 'notivue'
import type { MediaValue } from '../types'

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function isAcceptedImage(source: File | Blob): boolean {
  return ACCEPT.includes(source.type)
}

let limitPromise: Promise<number | null> | null = null
function getImageLimit(): Promise<number | null> {
  limitPromise ??= hikariRequest('/api/v3/uploads/images/limits')
    .then(r => r.max_image_bytes)
    .catch((): number | null => {
      limitPromise = null
      return null
    })
  return limitPromise
}

export async function validateImage(source: File | Blob): Promise<boolean> {
  if (!isAcceptedImage(source)) {
    push.error({ message: '不支持的图片格式' })
    return false
  }
  const max = await getImageLimit()
  if (max && source.size > max) {
    push.error({ message: `图片不能超过 ${Math.floor(max / 1024 / 1024)} MB` })
    return false
  }
  return true
}

export async function uploadImage(source: File | Blob): Promise<MediaValue | null> {
  if (!(await validateImage(source))) return null

  const form = new FormData()
  form.append('file', source)
  try {
    const result = await hikariRequest('/api/v3/uploads/images', {
      method: 'POST',
      body: form,
    })
    return { id: result.id, src: result.src, width: result.width, height: result.height }
  } catch {
    return null
  }
}
