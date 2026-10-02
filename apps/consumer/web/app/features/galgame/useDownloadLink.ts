import { toast } from '@hina-ui/vue'

export function useDownloadLink(galgameId: number) {
  const pendingIds = ref<number[]>([])
  const { copy } = useClipboard({ legacy: true })

  async function requestLinks(fileIds: number[]) {
    pendingIds.value = fileIds
    try {
      return await Promise.all(
        fileIds.map(fileId =>
          hikariRequest<'/api/v3/galgames/{id}/downloads/files/{file_id}/link'>(
            '/api/v3/galgames/{id}/downloads/files/{file_id}/link',
            { method: 'get', path: { id: galgameId, file_id: fileId } },
          ),
        ),
      )
    } catch {
      return null
    } finally {
      pendingIds.value = []
    }
  }

  async function download(fileId: number) {
    const links = await requestLinks([fileId])
    if (links) window.location.href = links[0]!.file_url
  }

  async function copyLinks(fileIds: number[]) {
    const links = await requestLinks(fileIds)
    if (!links) return

    await copy(links.map(link => link.file_url).join('\n'))
    const minutes = Math.round(Math.min(...links.map(link => link.expires_in)) / 60)
    toast.success(
      links.length > 1
        ? `已复制 ${links.length} 个链接，${minutes} 分钟内有效`
        : `链接已复制，${minutes} 分钟内有效`,
    )
  }

  return { pendingIds, download, copyLinks }
}
