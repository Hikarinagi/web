export interface LandingDay<T> {
  date: string
  past: boolean
  items: T[]
}

export function groupByDay<T>(
  items: T[],
  dateOf: (item: T) => string | null | undefined,
  today: string,
): LandingDay<T>[] {
  const days = new Map<string, T[]>()
  for (const item of items) {
    const date = dateOf(item)
    if (date) days.set(date, [...(days.get(date) ?? []), item])
  }
  return [...days]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, list]) => ({ date, past: date < today, items: list }))
}

export function useAlignTo(
  viewport: () => HTMLElement | null | undefined,
  target: () => HTMLElement | null | undefined,
  axis: 'x' | 'y',
) {
  function align() {
    const box = viewport()
    const el = target()
    if (!box || !el) return
    const from = box.getBoundingClientRect()
    const to = el.getBoundingClientRect()
    if (axis === 'x') box.scrollLeft += to.left - from.left - 16
    else box.scrollTop += to.top - from.top - 8
  }
  watch(viewport, box => box && requestAnimationFrame(() => requestAnimationFrame(align)), {
    immediate: true,
    flush: 'post',
  })
}

export function useReveal(
  viewport: () => HTMLElement | null | undefined,
  selected: () => number,
  axis: 'x' | 'y',
) {
  watch(
    selected,
    id => {
      const box = viewport()
      const el = box?.querySelector<HTMLElement>(`[data-stage-item="${id}"]`)
      if (!box || !el) return
      const from = box.getBoundingClientRect()
      const to = el.getBoundingClientRect()
      const start = axis === 'x' ? to.left - from.left : to.top - from.top
      const end = axis === 'x' ? to.right - from.right : to.bottom - from.bottom
      const delta = start < 0 ? start - 16 : end > 0 ? end + 16 : 0
      if (delta) box.scrollBy({ [axis === 'x' ? 'left' : 'top']: delta, behavior: 'smooth' })
    },
    { flush: 'post' },
  )
}

export function useCentered(
  viewport: () => HTMLElement | null | undefined,
  selected: () => number,
) {
  function center(smooth: boolean) {
    const box = viewport()
    const el = box?.querySelector<HTMLElement>(`[data-stage-item="${selected()}"]`)
    if (!box || !el) return
    const from = box.getBoundingClientRect()
    const to = el.getBoundingClientRect()
    const delta = to.left + to.width / 2 - (from.left + from.width / 2)
    box.scrollBy({ left: delta, behavior: smooth ? 'smooth' : 'instant' })
  }
  watch(
    viewport,
    box => box && requestAnimationFrame(() => requestAnimationFrame(() => center(false))),
    {
      immediate: true,
      flush: 'post',
    },
  )
  watch(selected, () => center(true), { flush: 'post' })
}

export function useAutoplay(stage: () => HTMLElement | null | undefined) {
  const target = computed(() => stage() ?? null)
  const hovered = useElementHover(target)
  const active = useActiveElement()
  const keyboard = computed(
    () =>
      !!active.value &&
      !!target.value?.contains(active.value) &&
      active.value.matches(':focus-visible'),
  )
  const visibility = useDocumentVisibility()
  const motion = usePreferredReducedMotion()
  return {
    running: computed(() => motion.value !== 'reduce'),
    paused: computed(() => hovered.value || keyboard.value || visibility.value !== 'visible'),
  }
}

export function useStagePick<T>(initial: T) {
  const selected = shallowRef(initial)

  function pick(item: T) {
    selected.value = item
  }

  return { selected, pick }
}
