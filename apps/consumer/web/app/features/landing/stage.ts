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

export function useStagePick<T>(initial: T) {
  const selected = shallowRef(initial)
  let timer: ReturnType<typeof setTimeout> | undefined

  function pick(item: T) {
    clearTimeout(timer)
    selected.value = item
  }

  function hover(item: T) {
    clearTimeout(timer)
    timer = setTimeout(() => (selected.value = item), 120)
  }

  function leave() {
    clearTimeout(timer)
  }

  function tap(event: MouseEvent, item: T, current: boolean) {
    if ((event as PointerEvent).pointerType !== 'touch' || current) return
    event.preventDefault()
    pick(item)
  }

  onBeforeUnmount(leave)
  return { selected, pick, hover, leave, tap }
}
