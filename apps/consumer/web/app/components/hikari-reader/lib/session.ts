import { nextTick } from 'vue'
import type { ReaderViewport } from '../types'

export const DEFAULT_READER_ERROR = '阅读器加载失败'

export async function loadReaderEpub(volumeId: number) {
  const session = await hikariRequest('/api/v3/reader/sessions', {
    method: 'POST',
    body: { volume_id: volumeId },
  })
  const response = await fetch(session.url)
  if (!response.ok) throw new Error(`[HikariReader] EPUB 下载失败：${response.status}`)

  return response.arrayBuffer()
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
