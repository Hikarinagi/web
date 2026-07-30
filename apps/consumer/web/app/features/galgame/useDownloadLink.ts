import { ref } from 'vue'
import { push } from 'notivue'

export function useDownloadLink(galgameId: number) {
  const pendingFileId = ref<number | null>(null)

  async function requestLink(fileId: number) {
    pendingFileId.value = fileId
    try {
      return await hikariRequest<'/api/v3/galgames/{id}/downloads/files/{file_id}/link'>(
        '/api/v3/galgames/{id}/downloads/files/{file_id}/link',
        { method: 'get', path: { id: galgameId, file_id: fileId } },
      )
    } catch {
      return null
    } finally {
      pendingFileId.value = null
    }
  }

  async function download(fileId: number) {
    const link = await requestLink(fileId)
    if (!link) return

    window.location.href = link.file_url
  }

  async function copyLink(fileId: number) {
    const link = await requestLink(fileId)
    if (!link) return

    const minutes = Math.round(link.expires_in / 60)
    try {
      await navigator.clipboard.writeText(link.file_url)
      push.success({ message: `链接已复制，${minutes} 分钟内有效` })
    } catch {
      push.error({ message: '复制失败，请手动长按链接复制' })
    }
  }

  return { pendingFileId, download, copyLink }
}
