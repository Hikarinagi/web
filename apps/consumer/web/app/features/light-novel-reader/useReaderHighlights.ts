import type { OverlayAnchor } from '@hina-ui/vue'
import type { Reader, ReaderAnnotationTarget } from '@ritojs/core'
import type { AnnotationRecord, ReaderController, ReadingPosition } from '@ritojs/kit'
import { animate } from 'motion-v'
import {
  HIGHLIGHT_COLORS,
  diffRecords,
  highlightColor,
  isTarget,
  legacyRange,
  type ReaderAnnotation,
} from './highlights'
import { positionOf, targetOf } from './payload'

const FLASH = { alpha: 0.75, half: 0.15, hold: 1000, ease: [0.4, 0, 0.2, 1] } as const

export interface HighlightEntry {
  id: string
  serverId: number | null
  target: ReaderAnnotationTarget | null
  quote: string
  color: string
  note: string
  createdAt: number
  failed: boolean
}

function entryOf(item: ReaderAnnotation, target: ReaderAnnotationTarget | null): HighlightEntry {
  return shallowReactive({
    id: item.client_id,
    serverId: item.id,
    target,
    quote: item.text ?? target?.quote.exact ?? '',
    color: highlightColor(item.highlight_color),
    note: item.note ?? '',
    createdAt: Date.parse(item.created_at),
    failed: false,
  })
}

export function useReaderHighlights(options: {
  volumeId: () => number
  position: () => ReadingPosition | null
  controller: () => ReaderController | undefined
}) {
  const entries = ref<HighlightEntry[]>([])
  const preview = shallowRef<HighlightEntry | null>(null)
  const inspector = shallowReactive({
    open: false,
    id: null as string | null,
    anchor: null as OverlayAnchor | null,
    focus: false,
  })
  const flashing = new Set<string>()
  const reduced = usePreferredReducedMotion()
  const retries: { entry: HighlightEntry; run: () => Promise<unknown> }[] = []
  let legacy: ReaderAnnotation[] = []
  let chain: Promise<void> = Promise.resolve()

  function enqueue(entry: HighlightEntry, run: () => Promise<unknown>) {
    chain = chain.then(() =>
      run().then(
        () => void (entry.failed = false),
        () => {
          entry.failed = true
          retries.push({ entry, run })
        },
      ),
    )
  }

  function patch(entry: HighlightEntry, body: Record<string, unknown>) {
    enqueue(entry, () => {
      if (entry.serverId == null) return Promise.reject(new Error('未同步'))
      return hikariRequest('/api/v3/reader/annotations/{id}', {
        method: 'patch',
        path: { id: entry.serverId },
        body,
        toast: false,
      })
    })
  }

  function create(record: AnnotationRecord) {
    const entry: HighlightEntry = shallowReactive({
      id: record.id,
      serverId: null,
      target: record.target,
      quote: record.target.quote.exact,
      color: record.color ?? HIGHLIGHT_COLORS[0].value,
      note: record.note ?? '',
      createdAt: record.createdAt,
      failed: false,
    })
    entries.value.push(entry)
    const volumeId = options.volumeId()
    const position = options.position()
    enqueue(entry, async () => {
      const saved = await hikariRequest('/api/v3/reader/volumes/{volume_id}/annotations', {
        method: 'post',
        path: { volume_id: volumeId },
        body: {
          client_id: entry.id,
          kind: 'HIGHLIGHT',
          target: targetOf(record.target),
          position: position
            ? positionOf(position)
            : { projection: { spreadIndex: 0, pageIndex: 0 }, progress: 0, timestamp: Date.now() },
          highlight_color: entry.color,
          text: entry.quote,
          ...(entry.note ? { note: entry.note } : {}),
        },
        toast: false,
      })
      entry.serverId = saved.id
    })
  }

  function sync(records: readonly AnnotationRecord[]) {
    const placed = entries.value.filter(entry => entry.target)
    const synced = new Map(
      placed.map(entry => [entry.id, { color: entry.color, note: entry.note }]),
    )
    const { created, changed, removed } = diffRecords(
      synced,
      records.filter(record => !record.id.startsWith('tour-')),
    )
    created.forEach(create)
    for (const { record, color, note } of changed) {
      const entry = placed.find(item => item.id === record.id)!
      const recolor = color !== undefined && !flashing.has(record.id)
      if (recolor) entry.color = color
      if (note !== undefined) entry.note = note
      if (recolor || note !== undefined)
        patch(entry, {
          ...(recolor ? { highlight_color: color } : {}),
          ...(note === undefined ? {} : { note: note || null }),
        })
    }
    for (const id of removed) remove(id)
  }

  function remove(id: string) {
    const entry = entries.value.find(item => item.id === id)
    if (!entry) return
    entries.value = entries.value.filter(item => item !== entry)
    if (inspector.id === id) inspector.open = false
    if (entry.target) options.controller()?.removeAnnotation(id)
    enqueue(entry, () =>
      entry.serverId == null
        ? Promise.resolve()
        : hikariRequest('/api/v3/reader/annotations/{id}', {
            method: 'delete',
            path: { id: entry.serverId },
            toast: false,
          }),
    )
  }

  function restore({ id, target, color, note, createdAt }: HighlightEntry) {
    if (!target) return
    options.controller()?.insertAnnotation({
      id,
      kind: 'highlight',
      target,
      color,
      ...(note ? { note } : {}),
      createdAt,
    })
  }

  function reset(list: readonly ReaderAnnotation[]) {
    inspector.open = false
    legacy = list.filter(item => !isTarget(item.target))
    entries.value = list.flatMap(item =>
      isTarget(item.target) ? [entryOf(item, item.target)] : [],
    )
  }

  async function prepare(reader: Reader) {
    const pending = legacy
    legacy = []
    for (const item of pending) {
      const old = legacyRange(item.target)
      const target = old
        ? await reader.interactions
            ?.createAnnotationTarget?.({
              href: reader.manifestHrefMap.get(old.href) ?? old.href,
              sourceRange: old.sourceRange,
            })
            .catch(() => undefined)
        : undefined
      const entry = entryOf(item, target ?? null)
      entries.value.push(entry)
      if (target) patch(entry, { target: targetOf(target) })
    }
  }

  const adapter = {
    load: async (): Promise<AnnotationRecord[]> =>
      entries.value.flatMap(entry =>
        entry.target
          ? [
              {
                id: entry.id,
                kind: 'highlight' as const,
                target: entry.target,
                color: entry.color,
                ...(entry.note ? { note: entry.note } : {}),
                createdAt: entry.createdAt,
              },
            ]
          : [],
      ),
    save: async (records: readonly AnnotationRecord[]) => sync(records),
  }

  function retry() {
    for (const { entry, run } of retries.splice(0)) enqueue(entry, run)
  }

  async function reveal(id: string) {
    const controller = options.controller()
    const entry = entries.value.find(item => item.id === id)
    if (!controller || !entry?.target || flashing.has(id)) return
    const { href, sourceRange } = entry.target
    await controller.goToPosition({
      sourceLocator: { href, sourceRange },
      projection: { spreadIndex: 0, pageIndex: 0 },
      progress: 0,
      timestamp: Date.now(),
    })
    const base = Number(/([\d.]+)\s*\)$/.exec(entry.color)?.[1] ?? 0.35)
    const tint = (alpha: number) =>
      controller.updateAnnotation(id, {
        color: entry.color.replace(/[\d.]+\s*\)$/, `${alpha.toFixed(3)})`),
      })
    flashing.add(id)
    if (reduced.value === 'reduce') {
      tint(FLASH.alpha)
      await new Promise(resolve => setTimeout(resolve, FLASH.hold))
    } else {
      for (const [from, to] of [
        [base, FLASH.alpha],
        [FLASH.alpha, base],
        [base, FLASH.alpha],
        [FLASH.alpha, base],
      ] as const) {
        await animate(from, to, { duration: FLASH.half, ease: [...FLASH.ease], onUpdate: tint })
      }
    }
    controller.updateAnnotation(id, { color: entry.color })
    flashing.delete(id)
  }

  function inspect(id: string, anchor: OverlayAnchor | null, focus = false) {
    Object.assign(inspector, { open: true, id, anchor, focus })
  }

  useEventListener('online', retry)

  return {
    entries,
    preview,
    inspector,
    adapter,
    reset,
    prepare,
    remove,
    restore,
    retry,
    reveal,
    inspect,
  }
}

export type ReaderHighlights = ReturnType<typeof useReaderHighlights>
