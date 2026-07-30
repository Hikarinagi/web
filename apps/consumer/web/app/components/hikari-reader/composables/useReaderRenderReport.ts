import { ref, type Ref } from 'vue'
import { push } from 'notivue'
import type { BackendReaderSettings } from '../types'
import type { useHikariReader } from './useHikariReader'

interface UseReaderRenderReportOptions {
  volumeId: number
  reader: ReturnType<typeof useHikariReader>
  settings: Ref<BackendReaderSettings>
}

/**
 * Owns the "report a rendering issue" dialog: snapshots the live reader/Rito runtime
 * state when opened, and POSTs it (plus an optional note) so Rito can triage real cases.
 */
export function useReaderRenderReport(options: UseReaderRenderReportOptions) {
  const config = useRuntimeConfig()
  const open = ref(false)
  const submitting = ref(false)
  const snapshot = ref<Record<string, unknown> | null>(null)

  function buildSnapshot(): Record<string, unknown> {
    const r = options.reader
    const readerObj = r.reader.value
    const controller = r.controller.value
    const position = r.currentPosition.value
    const pageIndex = position?.projection.pageIndex
    const chapter =
      pageIndex === undefined || !readerObj
        ? null
        : (readerObj.findActiveTocEntry(pageIndex) ?? null)
    const rect = r.surface.value?.getBoundingClientRect()
    return {
      volume_id: options.volumeId,
      reported_at: new Date().toISOString(),
      user_agent: typeof navigator === 'undefined' ? null : navigator.userAgent,
      rito_version: config.public.ritoVersion ?? null,
      rito_metadata: readerObj?.metadata ?? null,
      position: position ?? null,
      current_spread: r.currentSpread.value,
      total_spreads: r.totalSpreads.value,
      progress: position?.progress ?? null,
      chapter: chapter ? { href: chapter.href, title: chapter.label } : null,
      viewport: rect ? { width: Math.round(rect.width), height: Math.round(rect.height) } : null,
      dpr: readerObj?.dpr ?? null,
      render_scale: controller?.renderScale ?? null,
      settings: { ...options.settings.value },
      error: r.error.value,
    }
  }

  function openReport() {
    snapshot.value = buildSnapshot()
    open.value = true
  }

  async function submit(note: string | null) {
    if (!snapshot.value) return
    submitting.value = true
    try {
      await hikariRequest<'/api/v3/reader/volumes/{volume_id}/render-reports', 'post'>(
        '/api/v3/reader/volumes/{volume_id}/render-reports',
        {
          method: 'post',
          path: { volume_id: options.volumeId },
          body: { note: note ?? undefined, metadata: snapshot.value },
        },
      )
      push.success({ message: '已收到你的渲染反馈,谢谢!' })
      open.value = false
    } catch {
      // hikariRequest surfaces the API error toast automatically
    } finally {
      submitting.value = false
    }
  }

  return { open, submitting, snapshot, openReport, submit }
}
