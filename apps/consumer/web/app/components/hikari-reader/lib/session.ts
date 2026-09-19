import { nextTick } from 'vue'
import type { ReaderViewport } from '../types'

export const DEFAULT_READER_ERROR = '阅读器加载失败'
export const DEFAULT_RUNTIME_ERROR = '阅读器出现了一次内部错误'

export type ReaderLoadPhase = 'session' | 'download' | 'parse' | 'restore'

export interface ReaderDownloadProgress {
  loaded: number
  total: number | null
}

interface ReaderLoadHooks {
  onPhase: (phase: ReaderLoadPhase) => void
  onDownload: (progress: ReaderDownloadProgress) => void
}

export async function loadReaderEpub(volumeId: number, hooks: ReaderLoadHooks) {
  hooks.onPhase('session')
  const session = await hikariRequest('/api/v3/reader/sessions', {
    method: 'POST',
    body: { volume_id: volumeId },
  })

  hooks.onPhase('download')
  const response = await fetch(session.url)
  if (!response.ok) throw new Error(`[HikariReader] EPUB 下载失败：${response.status}`)

  const declared = Number(response.headers.get('content-length'))
  const total = Number.isFinite(declared) && declared > 0 ? declared : null
  const stream = response.body
  if (!stream) return response.arrayBuffer()

  hooks.onDownload({ loaded: 0, total })
  const chunks: Uint8Array[] = []
  const reader = stream.getReader()
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.byteLength
    hooks.onDownload({ loaded, total })
  }

  const buffer = new ArrayBuffer(loaded)
  const merged = new Uint8Array(buffer)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return buffer
}

export async function resolveViewport(surface: HTMLElement | null): Promise<ReaderViewport> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  const rect = surface?.getBoundingClientRect()
  if (!rect) {
    throw new Error('[HikariReader] 阅读区域不可用')
  }
  return {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  }
}

export function getReaderError(error: unknown) {
  return error instanceof Error ? error.message : DEFAULT_READER_ERROR
}
