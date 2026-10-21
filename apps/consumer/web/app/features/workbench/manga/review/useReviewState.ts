import type {
  BackendMangaBaselinePage,
  BackendMangaCheck,
  BackendMangaNote,
  BackendMangaPage,
} from '../manga'

export type ReviewView = 'overview' | 'page'
export type CompareMode = 'side' | 'swipe' | 'toggle'
export type ReviewFilter =
  'all' | 'flagged' | 'notes' | 'unmatched' | 'duplicate' | 'blank' | 'size'
export type ReviewZoom = 'fit' | 1 | 2
export type ReviewSide = 'upload' | 'baseline'

export function useReviewState(input: {
  pages: () => BackendMangaPage[]
  baseline: () => BackendMangaBaselinePage[]
  check: () => BackendMangaCheck | null
  notes: () => BackendMangaNote[]
  narrow: () => boolean
}) {
  const view = ref<ReviewView>('overview')
  const chosenMode = ref<CompareMode>('side')
  const filter = ref<ReviewFilter>('all')
  const index = ref(0)
  const zoom = ref<ReviewZoom>('fit')
  const center = ref({ x: 0.5, y: 0.5 })
  const showing = ref<ReviewSide>('upload')
  const override = ref<number | null>(null)

  const replacement = computed(() => input.baseline().length > 0)
  const mode = computed<CompareMode>({
    get: () => (input.narrow() ? 'toggle' : chosenMode.value),
    set: value => {
      chosenMode.value = value
    },
  })

  const rows = computed(() => {
    const result = input.check()?.result ?? null
    const baseline = input.baseline()
    const checked = new Map(result?.pages.map(row => [row.page_id, row]) ?? [])
    const position = new Map(baseline.map((page, at) => [page.id, at]))
    const notes = new Map<number, number>()
    for (const note of input.notes()) notes.set(note.page_id, (notes.get(note.page_id) ?? 0) + 1)
    return input.pages().map((page, at) => {
      const row = checked.get(page.id)
      const matched = row && row.match !== null ? result?.baseline?.[row.match]?.page_id : null
      const match = !replacement.value
        ? null
        : row
          ? matched == null
            ? null
            : (position.get(matched) ?? null)
          : at < baseline.length
            ? at
            : null
      return {
        page,
        number: at + 1,
        flags: row?.flags ?? [],
        match,
        unmatched: replacement.value && !!row && match === null,
        notes: notes.get(page.id) ?? 0,
      }
    })
  })

  const counts = computed(() => ({
    all: rows.value.length,
    flagged: rows.value.filter(row => row.flags.length || row.unmatched).length,
    notes: rows.value.filter(row => row.notes).length,
    unmatched: rows.value.filter(row => row.unmatched).length,
  }))

  const visible = computed(() =>
    rows.value.filter(row => {
      const current = filter.value
      if (current === 'all') return true
      if (current === 'flagged') return row.flags.length > 0 || row.unmatched
      if (current === 'notes') return row.notes > 0
      if (current === 'unmatched') return row.unmatched
      return (row.flags as string[]).includes(current)
    }),
  )

  const current = computed(() => rows.value[index.value] ?? null)
  const baselineIndex = computed(() => override.value ?? current.value?.match ?? null)
  const baselinePage = computed(() =>
    baselineIndex.value === null ? null : (input.baseline()[baselineIndex.value] ?? null),
  )

  watch(index, () => {
    override.value = null
  })

  function open(at: number) {
    index.value = Math.min(Math.max(at, 0), Math.max(rows.value.length - 1, 0))
    view.value = 'page'
  }

  function openPage(pageId: number) {
    const at = rows.value.findIndex(row => row.page.id === pageId)
    if (at >= 0) open(at)
  }

  function step(delta: number) {
    if (view.value === 'page') open(index.value + delta)
  }

  function zoomBy(delta: 1 | -1) {
    const levels: ReviewZoom[] = ['fit', 1, 2]
    const at = levels.indexOf(zoom.value) + delta
    zoom.value = levels[Math.min(Math.max(at, 0), levels.length - 1)] ?? 'fit'
  }

  return {
    view,
    mode,
    filter,
    index,
    zoom,
    center,
    showing,
    override,
    replacement,
    rows,
    counts,
    visible,
    current,
    baselineIndex,
    baselinePage,
    open,
    openPage,
    step,
    zoomBy,
  }
}

export type ReviewState = ReturnType<typeof useReviewState>
