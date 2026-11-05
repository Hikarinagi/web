import type { MaybeRefOrGetter } from 'vue'

type Offset = [top: number, left: number]

const KEPT_PAGES = 50

export function useTabScroll(content: MaybeRefOrGetter<HTMLElement | null | undefined>) {
  const { currentRoute } = useRouter()
  const store = useCreatorTabsStore()
  const key = computed(() => store.pageKey(currentRoute.value.path))
  const positions = new Map<string, Map<Element, Offset>>()
  const viewports = new Set<Element>()

  useEventListener(
    document,
    'scroll',
    event => {
      const root = toValue(content)
      const target = event.target
      if (!root || !(target instanceof Element)) return
      const outer = target.contains(root)
      if (!outer && !root.contains(target)) return
      if (outer) viewports.add(target)
      const map = positions.get(key.value) ?? new Map<Element, Offset>()
      positions.delete(key.value)
      positions.set(key.value, map.set(target, [target.scrollTop, target.scrollLeft]))
      if (positions.size > KEPT_PAGES) positions.delete(positions.keys().next().value!)
    },
    { capture: true, passive: true },
  )

  watch(
    key,
    async next => {
      await nextTick()
      requestAnimationFrame(() => {
        const map = positions.get(next)
        for (const viewport of viewports) {
          if (!viewport.isConnected) viewports.delete(viewport)
          else if (!map?.has(viewport)) viewport.scrollTop = 0
        }
        for (const [element, [top, left]] of map ?? []) {
          if (!element.isConnected) continue
          element.scrollTop = top
          element.scrollLeft = left
        }
      })
    },
    { flush: 'post' },
  )
}
