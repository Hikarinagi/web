import { validateImage } from '~/components/media-library/lib/upload'
import type { MediaValue } from '~/components/media-library/types'

export async function uploadProfileImage(source: File | Blob): Promise<MediaValue | null> {
  if (!(await validateImage(source))) return null

  const form = new FormData()
  form.append('file', source)
  try {
    const result = await hikariRequest('/api/v3/uploads/images/profile', {
      method: 'POST',
      body: form,
    })
    return { id: result.id, src: result.src, width: result.width, height: result.height }
  } catch {
    return null
  }
}
