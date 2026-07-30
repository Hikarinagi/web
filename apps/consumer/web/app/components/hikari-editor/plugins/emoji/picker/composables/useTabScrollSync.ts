import type { ComputedRef, Ref } from 'vue'

interface ScrollAreaExposed {
  viewport: HTMLElement | null
}

const PROG_SCROLL_MS = 600
const IO_ROOT_MARGIN = '-10% 0px -80% 0px'

export function useTabScrollSync(opts: {
  scroller: Ref<ScrollAreaExposed | null>
  sectionIds: ComputedRef<string[]>
  initialId?: string
}) {
  const activeId = ref<string | null>(opts.initialId ?? null)
  const viewport = computed<HTMLElement | null>(() => opts.scroller.value?.viewport ?? null)

  const sectionEls = computed<HTMLElement[]>(() => {
    const root = viewport.value
    if (!root) return []
    return opts.sectionIds.value
      .map(id => root.querySelector<HTMLElement>(`[data-section-id="${CSS.escape(id)}"]`))
      .filter((el): el is HTMLElement => el !== null)
  })
  const { isPending: programmaticScroll, start: startScrollLock } = useTimeoutFn(
    () => {},
    PROG_SCROLL_MS,
    { immediate: false },
  )

  function onTabClick(id: string) {
    const root = viewport.value
    const target = root?.querySelector<HTMLElement>(`[data-section-id="${CSS.escape(id)}"]`)
    if (!root || !target) return
    activeId.value = id
    startScrollLock()
    const targetRect = target.getBoundingClientRect()
    const viewportRect = root.getBoundingClientRect()
    const top = root.scrollTop + (targetRect.top - viewportRect.top)
    root.scrollTo({ top, behavior: 'smooth' })
  }

  useIntersectionObserver(
    sectionEls,
    entries => {
      if (programmaticScroll.value) return
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      const top = visible[0]
      if (!top) return
      const id = top.target.getAttribute('data-section-id')
      if (id) activeId.value = id
    },
    { root: viewport, rootMargin: IO_ROOT_MARGIN },
  )

  watch(
    opts.sectionIds,
    ids => {
      if (activeId.value === null && ids.length > 0) {
        activeId.value = ids[0] ?? null
      }
    },
    { immediate: true },
  )

  return { activeId, onTabClick }
}
