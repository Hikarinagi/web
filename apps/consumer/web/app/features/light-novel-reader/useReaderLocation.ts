import type { ReadingPosition } from '@ritojs/kit'
import { rowAt, spineIndexOf, tocRows, type TocRow } from './toc'
import type { ReaderEngine } from './useReaderEngine'

export function useReaderLocation(engine: ReaderEngine) {
  const rows = shallowRef<TocRow[]>([])
  const laid = ref(false)
  const position = shallowRef<ReadingPosition | null>(null)
  const title = ref('')
  const turns = shallowRef<number[]>([])

  watch(
    engine.stack,
    (stack, _, onCleanup) => {
      laid.value = false
      rows.value = []
      position.value = null
      title.value = ''
      turns.value = []
      if (!stack) return
      const { reader, controller } = stack
      const layout = () => {
        laid.value = reader.layoutScope !== 'chapter' && controller.totalSpreads > 0
        rows.value = tocRows(reader, laid.value)
      }
      layout()
      const offLayout = controller.on('layoutChange', layout)
      const offPosition = controller.on('positionChange', ({ position: next }) => {
        position.value = next
        turns.value = [...turns.value.slice(-11), Date.now()]
        const href = next.sourceLocator?.href
        const point = next.sourceLocator?.sourcePoint
        if (!href || !point) {
          title.value = ''
          return
        }
        void reader.interactions?.tocEntryAtPosition?.({ href, point }).then(entry => {
          if (position.value === next) title.value = entry?.label.trim() ?? ''
        })
      })
      onCleanup(() => {
        offLayout()
        offPosition()
      })
    },
    { immediate: true },
  )

  const pages = computed(() => {
    const stack = engine.stack.value
    const spread = position.value?.projection.spreadIndex
    if (!stack || !laid.value || spread == null) return null
    return stack.controller.spreads[spread]?.pageIndexes ?? null
  })

  const current = computed(() => (pages.value ? rowAt(rows.value, pages.value[0]!) : undefined))

  const chapter = computed(() => {
    const row = current.value
    const shown = pages.value
    if (!row || row.start == null || row.pages == null || !shown) return null
    return {
      from: shown[0]! - row.start + 1,
      to: shown[shown.length - 1]! - row.start + 1,
      total: row.pages,
    }
  })

  const minutesLeft = computed(() => {
    const span = chapter.value
    const times = turns.value
    if (!span || span.total <= span.to || times.length < 4) return null
    const gaps = times
      .slice(1)
      .map((time, index) => time - times[index]!)
      .filter(gap => gap >= 3_000 && gap <= 300_000)
    if (gaps.length < 3) return null
    const perPage =
      gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length / (pages.value?.length ?? 1)
    return Math.max(1, Math.round(((span.total - span.to) * perPage) / 60_000))
  })

  const spine = computed(() => {
    const stack = engine.stack.value
    return stack ? spineIndexOf(stack.reader, position.value?.sourceLocator?.href) : undefined
  })

  return { rows, laid, position, title, current, chapter, minutesLeft, spine }
}

export type ReaderLocation = ReturnType<typeof useReaderLocation>
