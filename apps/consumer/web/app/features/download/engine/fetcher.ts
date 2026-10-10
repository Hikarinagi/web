import { createFileKey, decryptFile } from '~/utils/media/file-crypto'
import type { DownloadManifest, ManifestEntry, ManifestFile } from './types'

const RETRY_DELAYS = [1000, 2000, 4000]
const encoder = new TextEncoder()

export class EntryError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly retryable: boolean,
  ) {
    super(message)
    this.name = 'EntryError'
  }
}

function endpoint(manifest: DownloadManifest, file: ManifestFile, entry: ManifestEntry) {
  if (entry.kind === 'page') {
    return {
      url: `/api/v3/reader/mangas/${manifest.series_id}/chapters/${entry.chapter_id}/pages/${entry.page_id}/content`,
      aad: `manga:page:${manifest.series_id}:${entry.chapter_id}:${entry.page_id}`,
    }
  }
  return {
    url: `/api/v3/user/me/downloads/${manifest.task_id}/files/${file.index}/chunks/${entry.index}/content`,
    aad: `download:${manifest.task_id}:${file.index}:${entry.index}`,
  }
}

async function failure(response: Response): Promise<EntryError> {
  const retryable = response.status >= 500 || response.status === 429 || response.status === 408
  if (response.headers.get('content-type')?.includes('application/json')) {
    const body = (await response.json().catch(() => null)) as {
      error?: { code?: string; message?: string }
    } | null
    const code = body?.error?.code ?? `HTTP_${response.status}`
    return new EntryError(code, body?.error?.message ?? `请求失败（${response.status}）`, retryable)
  }
  return new EntryError(`HTTP_${response.status}`, `请求失败（${response.status}）`, retryable)
}

async function once(
  url: string,
  aad: string,
  expected: number,
  signal: AbortSignal,
): Promise<Uint8Array> {
  const key = createFileKey()
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json', accept: 'application/octet-stream' },
    body: JSON.stringify({ p: key }),
    signal,
  })
  if (!response.ok) throw await failure(response)
  const encrypted = await response.arrayBuffer()
  const plain = new Uint8Array(await decryptFile(aad, key, encrypted))
  if (plain.byteLength !== expected) {
    throw new EntryError('DOWNLOAD_CONTENT_CHANGED', '文件内容与清单不一致', false)
  }
  return plain
}

export async function fetchEntry(
  manifest: DownloadManifest,
  file: ManifestFile,
  entry: ManifestEntry,
  signal: AbortSignal,
): Promise<Uint8Array> {
  if (entry.kind === 'text') {
    const data = encoder.encode(entry.data ?? '')
    if (data.byteLength !== entry.bytes) {
      throw new EntryError('DOWNLOAD_CONTENT_CHANGED', '清单文档大小不一致', false)
    }
    return data
  }
  const { url, aad } = endpoint(manifest, file, entry)
  for (let attempt = 0; ; attempt++) {
    signal.throwIfAborted()
    try {
      return await once(url, aad, entry.bytes, signal)
    } catch (error) {
      if (signal.aborted) throw error
      const retryable = !(error instanceof EntryError) || error.retryable
      if (!retryable || attempt >= RETRY_DELAYS.length) throw error
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, RETRY_DELAYS[attempt])
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer)
            reject(signal.reason)
          },
          { once: true },
        )
      })
    }
  }
}
