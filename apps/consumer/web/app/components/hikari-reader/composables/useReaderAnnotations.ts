import { computed, onBeforeUnmount, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { push } from 'notivue'
import type { Reader } from '@ritojs/core/web'
import type { ReadingPosition } from '@ritojs/core/position'
import type { ReaderController } from '@ritojs/kit'
import { buildHitMap } from '@ritojs/core/advanced'
import type { AnnotationRecord, AnnotationRecordPatch } from '@ritojs/core/annotations'
import { resolveAnnotations } from '@ritojs/core/annotations'
import type { BackendReaderVolumeState } from '~/components/hikari-reader/types'
import { toBackendKind, toBackendPosition, toRitoAnnotation } from '../lib/storage'

export type ReaderAnnotation = AnnotationRecord
export type ReaderAnnotationKind = AnnotationRecord['kind']

interface SelectionState {
  text: string
  anchor: { x: number; y: number }
}

interface ActionState {
  id: string
  anchor: { x: number; y: number }
}

interface UseReaderAnnotationsOptions {
  volumeId: number
  controller: ShallowRef<ReaderController | null>
  reader: ShallowRef<Reader | null>
  currentPosition: ShallowRef<ReadingPosition | null>
  surface: Ref<HTMLElement | null>
  initial: BackendReaderVolumeState['annotations']
}

export const ANNOTATION_COLORS = [
  { value: 'rgba(250, 204, 21, 0.35)', swatch: '#facc15', label: '黄色' },
  { value: 'rgba(74, 222, 128, 0.35)', swatch: '#4ade80', label: '绿色' },
  { value: 'rgba(96, 165, 250, 0.35)', swatch: '#60a5fa', label: '蓝色' },
  { value: 'rgba(244, 114, 182, 0.35)', swatch: '#f472b6', label: '粉色' },
  { value: 'rgba(167, 139, 250, 0.35)', swatch: '#a78bfa', label: '紫色' },
] as const

export const DEFAULT_ANNOTATION_COLOR = ANNOTATION_COLORS[0].value

function stripFragment(href: string): string {
  const idx = href.indexOf('#')
  return idx === -1 ? href : href.slice(0, idx)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function chapterRangeOf(reader: Reader, href: string) {
  const direct = reader.chapterMap.get(href)
  if (direct) return direct

  const targetHref = stripFragment(href)
  for (const [idref, manifestHref] of reader.manifestHrefMap) {
    if (stripFragment(manifestHref) !== targetHref) continue
    return reader.chapterMap.get(idref) ?? null
  }
  return null
}

function progressPageOf(record: AnnotationRecord, reader: Reader) {
  const range = chapterRangeOf(reader, record.target.href)
  if (!range) return null

  const rawProgress = record.target.selectors.progression.chapterProgress
  const progress = Number.isFinite(rawProgress) ? clamp(rawProgress, 0, 1) : 0
  const offset = Math.round((range.endPage - range.startPage) * progress)
  return range.startPage + offset
}

function exactPageOf(record: AnnotationRecord, reader: Reader) {
  const range = reader.chapterMap.get(record.target.href)
  if (!range) return null

  const hitMaps = new Map<number, ReturnType<typeof buildHitMap>>()
  for (let pageIndex = range.startPage; pageIndex <= range.endPage; pageIndex++) {
    const page = reader.pages[pageIndex]
    if (page) hitMaps.set(page.index, buildHitMap(page))
  }

  const [resolved] = resolveAnnotations([record], {
    chapterIndices: reader.getChapterTextIndices(),
    hitMaps,
    chapterPageRanges: reader.chapterMap,
    measurer: reader.measurer,
  })
  const pages = resolved?.segments.map(segment => segment.pageIndex) ?? []
  return pages.length ? Math.min(...pages) : null
}

export function useReaderAnnotations(options: UseReaderAnnotationsOptions) {
  const initialRecords = options.initial.map(toRitoAnnotation)
  const records = shallowRef<readonly AnnotationRecord[]>(initialRecords)
  const backendIds = new Map<string, number>(options.initial.map(item => [item.client_id, item.id]))
  const selection = shallowRef<SelectionState | null>(null)
  const activeAction = shallowRef<ActionState | null>(null)

  const list = computed(() =>
    [...records.value].sort((a, b) => {
      const ta = a.modifiedAt ?? a.createdAt
      const tb = b.modifiedAt ?? b.createdAt
      return tb - ta
    }),
  )

  function findRecord(id: string): AnnotationRecord | undefined {
    return records.value.find(r => r.id === id)
  }

  function chapterTitleOf(record: AnnotationRecord) {
    const reader = options.reader.value
    if (!reader) return null
    const pageIndex = progressPageOf(record, reader)
    if (pageIndex === null) return null
    return reader.findActiveTocEntry(pageIndex)?.label ?? null
  }

  function textOf(record: AnnotationRecord) {
    const selectors = record.target.selectors as { textQuote?: { exact?: string } } | undefined
    return selectors?.textQuote?.exact ?? ''
  }

  function dismissPopovers() {
    selection.value = null
    activeAction.value = null
  }

  function handleOutsidePointer(target: EventTarget | null) {
    if (!activeAction.value) return
    if (!(target instanceof HTMLElement)) return
    if (target.closest('[data-reader-action-popover]')) return
    activeAction.value = null
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape') return
    if (activeAction.value || selection.value) {
      dismissPopovers()
    }
  }

  async function add(input: { kind: ReaderAnnotationKind; color?: string; note?: string }) {
    const controller = options.controller.value
    if (!controller) return null
    const position = options.currentPosition.value
    if (!position) {
      push.warning({ message: '当前位置尚未就绪' })
      return null
    }
    const created = controller.addAnnotation({
      kind: input.kind,
      color: input.color ?? DEFAULT_ANNOTATION_COLOR,
      note: input.note,
    })
    if (!created) {
      push.warning({ message: '请先选择文字' })
      return null
    }
    selection.value = null

    try {
      const saved = await hikariRequest('/api/v3/reader/volumes/{volume_id}/annotations', {
        method: 'post',
        path: { volume_id: options.volumeId },
        body: {
          client_id: created.id,
          kind: toBackendKind(created.kind),
          target: { ...created.target } as Record<string, unknown>,
          position: toBackendPosition(position),
          highlight_color: created.color,
          note: created.note,
        },
        toast: false,
      })
      backendIds.set(created.id, saved.id)
      return saved
    } catch {
      controller.removeAnnotation(created.id)
      return null
    }
  }

  async function update(id: string, patch: AnnotationRecordPatch) {
    const controller = options.controller.value
    const backendId = backendIds.get(id)
    if (!controller || backendId === undefined) return
    const previous = findRecord(id)
    if (!previous) return

    controller.updateAnnotation(id, patch)
    try {
      await hikariRequest('/api/v3/reader/annotations/{id}', {
        method: 'patch',
        path: { id: backendId },
        body: {
          highlight_color: patch.color,
          note: patch.note ?? null,
        },
        toast: false,
      })
    } catch {
      push.error({ message: '更新标注失败，请稍后重试' })
    }
  }

  async function remove(id: string) {
    const controller = options.controller.value
    const backendId = backendIds.get(id)
    if (!controller || backendId === undefined) return
    activeAction.value = null

    controller.removeAnnotation(id)
    try {
      await hikariRequest('/api/v3/reader/annotations/{id}', {
        method: 'delete',
        path: { id: backendId },
        toast: false,
      })
      backendIds.delete(id)
    } catch {
      push.error({ message: '删除标注失败，请稍后重试' })
    }
  }

  function jumpTo(record: AnnotationRecord) {
    const reader = options.reader.value
    const controller = options.controller.value
    if (!reader || !controller) return
    const pageIndex = exactPageOf(record, reader) ?? progressPageOf(record, reader)
    if (pageIndex === null) return
    const spreadIndex = reader.findSpread(pageIndex)
    if (spreadIndex !== undefined) controller.goToSpread(spreadIndex)
  }

  let unsubs: Array<() => void> = []

  function attach(controller: ReaderController) {
    detach()
    const current = controller.annotations
    if (current.length > 0 || initialRecords.length === 0) {
      records.value = current
    }

    unsubs.push(
      controller.on('annotationsChange', ({ annotations }) => {
        records.value = annotations
      }),
    )

    unsubs.push(
      controller.on('selectionChange', ({ text, focusRect, viewportRects }) => {
        if (!text) {
          selection.value = null
          return
        }
        const targetRect = focusRect ?? viewportRects[viewportRects.length - 1]
        if (!targetRect) {
          selection.value = null
          return
        }
        const screen = viewportRectToScreen(targetRect, controller, options.surface.value)
        if (!screen) {
          selection.value = null
          return
        }
        activeAction.value = null
        selection.value = {
          text,
          anchor: {
            x: screen.x + screen.width / 2,
            y: screen.y,
          },
        }
      }),
    )

    unsubs.push(
      controller.on('annotationClick', ({ annotation, x, y }) => {
        selection.value = null
        activeAction.value = {
          id: annotation.id,
          anchor: { x, y },
        }
      }),
    )
  }

  function detach() {
    for (const unsub of unsubs) unsub()
    unsubs = []
  }

  watch(
    () => options.controller.value,
    controller => {
      if (controller) attach(controller)
      else detach()
    },
    { immediate: true },
  )

  if (import.meta.client) {
    window.addEventListener('keydown', handleEscape)
  }

  onBeforeUnmount(() => {
    if (import.meta.client) window.removeEventListener('keydown', handleEscape)
    detach()
  })

  return {
    records,
    list,
    selection,
    activeAction,
    findRecord,
    chapterTitleOf,
    textOf,
    add,
    update,
    remove,
    jumpTo,
    dismissPopovers,
    handleOutsidePointer,
  }
}

function viewportRectToScreen(
  rect: { x: number; y: number; width: number; height: number },
  controller: ReaderController,
  surface: HTMLElement | null,
): { x: number; y: number; width: number; height: number } | null {
  if (!surface) return null
  const canvas = surface.querySelector('canvas')
  if (!canvas) return null
  const cr = canvas.getBoundingClientRect()
  const scale = controller.renderScale
  return {
    x: cr.left + rect.x * scale,
    y: cr.top + rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  }
}
