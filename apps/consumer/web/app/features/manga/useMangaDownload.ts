import { useDownloadQueue } from '~/features/download/useDownloadQueue'
import type { MangaDownloadPart } from './download'
import { createFileKey, decryptFile } from '~/utils/media/file-crypto'

export function useMangaDownload(id: () => number) {
  return useDownloadQueue<MangaDownloadPart>({
    id,
    mime: 'application/vnd.comicbook+zip',
    load: target =>
      hikariRequest('/api/v3/user/me/manga/download/mangas/{id}', { path: { id: target } }),
    plan: (target, selected, signal) =>
      hikariRequest('/api/v3/user/me/manga/download/mangas/{id}/plan', {
        method: 'POST',
        path: { id: target },
        body: { chapter_ids: selected },
        signal,
      }),
    file: (target, part, signal) => {
      const key = createFileKey()
      return hikariRequest('/api/v3/user/me/manga/download/mangas/{id}/files', {
        method: 'POST',
        path: { id: target },
        body: {
          page_ids: part.page_ids,
          revision: part.revision,
          max_cards: part.required_cards,
          p: key,
        },
        responseType: 'arrayBuffer',
        decodeBinary: data => decryptFile(`manga:download:${target}:${part.revision}`, key, data),
        signal,
      })
    },
  })
}
