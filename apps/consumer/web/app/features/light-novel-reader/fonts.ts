import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { ReaderHostFontFace } from '@ritojs/core'
import { readApiBinary, type DownloadProgress } from '~/utils/api/binary'
import { readCached, writeCached } from './cache'

export type ReaderFont = ApiData<'/api/v3/reader/fonts', 'get'>[number]

export const FONT_PREVIEWS: Partial<Record<string, string>> = {
  original: 'Reader Preview Original',
  song: 'Reader Preview Song',
  kai: 'Reader Preview Kai',
}

export function fontCatalogue() {
  return hikariRequest('/api/v3/reader/fonts', { toast: false })
}

export function cachedFont(sha: string) {
  return readCached(`font/${sha}`)
}

export async function loadFont(
  font: ReaderFont,
  options: { onProgress?: (progress: DownloadProgress) => void; signal?: AbortSignal } = {},
) {
  const cached = await cachedFont(font.sha256)
  if (cached) return cached
  const response = await fetch(font.url, { signal: options.signal })
  const bytes = await readApiBinary(
    { status: response.status, headers: response.headers, _data: response.body ?? undefined },
    options.onProgress,
  )
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
  if (digest !== font.sha256) throw new Error('字体文件校验失败')
  await writeCached(`font/${font.sha256}`, bytes)
  return bytes
}

export function fontFace(sha: string, bytes: ArrayBuffer): ReaderHostFontFace {
  return { bytes, expectedSha256: sha, genericRole: 'serif' }
}
