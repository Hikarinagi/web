import { ref } from 'vue'
import type { ApiData } from '@hikarinagi/api-contract/v3'
import { useDownloadQueue } from '~/features/download/useDownloadQueue'
import { createFileKey, decryptFile } from '~/utils/media/file-crypto'

export function useNovelDownload(id: () => number, series = false) {
  const volumes = ref<ApiData<'/api/v3/user/me/novel/download/series/{id}', 'get'>['volumes']>([])
  const seriesId = ref(id())
  const flow = useDownloadQueue<
    ApiData<'/api/v3/user/me/novel/download/series/{id}/plan', 'post'>['parts'][number]
  >({
    id,
    mime: 'application/epub+zip',
    load: async target => {
      const result = await hikariRequest('/api/v3/user/me/novel/download/series/{id}', {
        path: { id: seriesId.value },
      })
      if (target === id()) {
        volumes.value = result.volumes
        flow.selected.value = series ? result.volumes.map(volume => volume.id) : [target]
      }
      return result
    },
    plan: (_target, selected, signal) =>
      hikariRequest('/api/v3/user/me/novel/download/series/{id}/plan', {
        method: 'POST',
        path: { id: seriesId.value },
        body: { volume_ids: selected },
        signal,
      }),
    file: (_target, part, signal) => {
      const key = createFileKey()
      return hikariRequest('/api/v3/user/me/novel/download/volumes/{id}', {
        method: 'POST',
        path: { id: part.id },
        body: { max_cards: part.required_cards, revision: part.revision, p: key },
        responseType: 'arrayBuffer',
        decodeBinary: data =>
          decryptFile(`novel:download:${part.id}:${part.revision ?? ''}`, key, data),
        signal,
      })
    },
  })
  const preparing = ref(false)

  async function prepare() {
    if (
      preparing.value ||
      flow.loading.value ||
      flow.busy.value ||
      flow.purchasing.value ||
      flow.open.value
    )
      return
    if (flow.status.value && (series || !flow.finished.value)) {
      await flow.prepare()
      return
    }
    preparing.value = true
    const target = id()
    try {
      if (series) seriesId.value = target
      else {
        const status = await hikariRequest('/api/v3/user/me/novel/download/volumes/{id}', {
          path: { id: target },
        })
        if (target !== id()) return
        seriesId.value = status.series_id
        if (status.unlocked) {
          await flow.direct({
            id: target,
            file_name: status.file_name,
            revision: status.revision,
            required_cards: 0,
          })
          return
        }
      }
      await flow.prepare()
    } catch {
      return
    } finally {
      preparing.value = false
    }
  }

  return { ...flow, volumes, preparing, prepare }
}
