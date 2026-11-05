import type { MaybeRefOrGetter } from 'vue'

type Offset = [top: number, left: number]

export function useTabScroll(content: MaybeRefOrGetter<HTMLElement | null | undefined>) {
  const route = useRoute()
  const store = useCreatorTabsStore()
  const key = computed(() => store.pageKey(route.path))
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
      positions.set(key.value, map.set(target, [target.scrollTop, target.scrollLeft]))
    },
    { capture: true, passive: true },
  )

  watch(
    key,
    async next => {
      const open = new Set(store.tabs.map(tab => tab.key))
      for (const stored of positions.keys()) {
        const base = stored.split('#')[0]!
        if (stored !== next && (!open.has(base) || store.pageKey(base) !== stored))
          positions.delete(stored)
      }
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
