import { nextTick } from 'vue'
import { decryptFile } from '~/utils/media/file-crypto'
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
  return hikariRequest('/api/v3/reader/sessions/{id}/content', {
    method: 'GET',
    path: { id: session.id },
    responseType: 'arrayBuffer',
    onDownload: hooks.onDownload,
    decodeBinary: data => decryptFile(session.id, session.p, data),
  })
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
