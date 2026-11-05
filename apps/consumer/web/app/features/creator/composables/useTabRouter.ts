import type { RouteLocationNormalized } from 'vue-router'
import { currentPath, resourceKey } from '~/features/creator/tabs'

export function useTabRouter() {
  if (import.meta.server) return
  const store = useCreatorTabsStore()
  const router = useRouter()
  const route = useRoute()
  const creator = (location: RouteLocationNormalized) => location.meta.layout === 'creator'
  const title = (location: RouteLocationNormalized) =>
    (location.meta.title as string | undefined) ?? '创作者中心'
  const position = () => Number(window.history.state?.position ?? 0)

  let last = position()
  let popped: number | null = null

  const stopListen = router.options.history.listen((_to, _from, info) => {
    popped = info.delta
  })

  const stopBefore = router.beforeEach((to, from) => {
    if (popped === null) {
      if (store.pending || store.travel !== null || !creator(to) || !creator(from)) return
      const resource = resourceKey(to.fullPath)
      if (resource === resourceKey(from.fullPath)) return
      const open = store.tabs.find(tab => resourceKey(currentPath(tab)) === resource)
      store.pending = open
        ? { id: open.id, push: true }
        : { id: store.open(to.fullPath, title(to)).id, push: false }
      return
    }
    const delta = popped
    popped = null
    const tab = store.active
    if (!tab || !creator(from)) return
    const index = tab.index + delta
    const wanted = tab.history[index]
    if (wanted !== undefined) {
      store.travel = index
      if (wanted === to.fullPath) return
      const target = router.resolve(wanted)
      return { path: target.path, query: target.query, hash: target.hash, replace: true }
    }
    if (!creator(to) && store.enteredId === tab.id) return
    store.travel = tab.index
    return { path: from.path, query: from.query, hash: from.hash, replace: true }
  })

  const stopAfter = router.afterEach((to, _from, failure) => {
    const now = position()
    const delta = now - last
    last = now
    if (failure || !creator(to)) {
      store.pending = null
      store.travel = null
      return
    }
    store.settle(to.fullPath, delta, title(to))
  })

  onMounted(() =>
    onNuxtReady(() => {
      last = position()
      store.enter(route.fullPath, title(route))
    }),
  )

  onScopeDispose(() => {
    stopListen()
    stopBefore()
    stopAfter()
  })
}
