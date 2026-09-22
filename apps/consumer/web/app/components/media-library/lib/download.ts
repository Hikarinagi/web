import { toast } from '@hina-ui/vue'
import type { MediaValue } from '../types'

function fileNameOf(media: MediaValue, url: string) {
  const path = url.split('?')[0] ?? ''
  const name = path.slice(path.lastIndexOf('/') + 1)
  return name || `image-${media.id}`
}

async function saveOne(media: MediaValue, url: string) {
  const response = await fetch(url, { mode: 'cors' })
  if (!response.ok) throw new Error(String(response.status))
  const blob = await response.blob()
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = fileNameOf(media, url)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(href)
}

export async function downloadMedia(items: MediaValue[], resolve: (media: MediaValue) => string) {
  let failed = 0
  for (const media of items) {
    try {
      await saveOne(media, resolve(media))
    } catch {
      failed += 1
    }
  }
  if (failed === items.length) {
    toast.danger('下载失败')
    return
  }
  if (failed) {
    toast.warning(`${failed} 张下载失败`)
    return
  }
  if (items.length > 1) toast.success(`已下载 ${items.length} 张`)
}
