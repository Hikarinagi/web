import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { ReaderPublicationShard, ReaderShardedPublication } from '@ritojs/core'
import { readApiBinary, type DownloadProgress } from '~/utils/api/binary'
import { readCached, touchBook, writeCached } from './cache'

export type ReaderSession = ApiData<'/api/v3/reader/sessions', 'post'>
type ReaderShard = ReaderSession['publication']['skeleton']

export function startSession(volumeId: number) {
  return hikariRequest('/api/v3/reader/sessions', {
    method: 'post',
    body: { volume_id: volumeId },
    toast: false,
  })
}

function keyOf(hex: string) {
  return Uint8Array.from(hex.match(/../g) ?? [], pair => Number.parseInt(pair, 16))
}

async function fetchShard(shard: ReaderShard, onProgress?: (progress: DownloadProgress) => void) {
  const response = await fetch(shard.url)
  return readApiBinary(
    { status: response.status, headers: response.headers, _data: response.body ?? undefined },
    onProgress,
  )
}

export async function cachedSkeleton(session: ReaderSession) {
  return readCached(`book/${session.publication.book_id}/0`)
}

export async function openPublication(
  volumeId: number,
  initial: ReaderSession,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<ReaderShardedPublication> {
  let session = initial
  const bookId = session.publication.book_id
  void touchBook(bookId)

  async function bytesOf(id: number): Promise<ArrayBuffer> {
    const path = `book/${bookId}/${id}`
    const cached = await readCached(path)
    if (cached) return cached
    const pick = () =>
      id === 0
        ? session.publication.skeleton
        : session.publication.shards.find(shard => shard.id === id)
    let shard = pick()
    if (!shard) throw new Error(`分片 ${id} 不在本卷的分片清单中`)
    if (Date.parse(session.expires_at) <= Date.now()) {
      session = await startSession(volumeId)
      if (session.publication.book_id !== bookId) throw new Error('本卷文件已更新')
      shard = pick()!
    }
    const bytes = await fetchShard(shard, id === 0 ? onProgress : undefined)
    await writeCached(path, bytes)
    return bytes
  }

  function keyFor(id: number) {
    const shard =
      id === 0
        ? session.publication.skeleton
        : session.publication.shards.find(item => item.id === id)
    return shard ? keyOf(shard.key) : undefined
  }

  return {
    skeleton: await bytesOf(0),
    key: keyFor(0),
    loadShards: ids =>
      Promise.all(
        ids.map(async (id): Promise<ReaderPublicationShard> => ({
          id,
          bytes: await bytesOf(id),
          key: keyFor(id),
        })),
      ),
  }
}
