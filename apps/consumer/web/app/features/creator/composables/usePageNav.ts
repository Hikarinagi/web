import type { LocationQuery, LocationQueryRaw, RouteLocationRaw } from 'vue-router'
import { goBack, previousPath } from '~/features/creator/history'

type Patch = Record<string, string | null | undefined>

export function usePageNav() {
  const route = useRoute()
  const router = useRouter()
  const store = useCreatorTabsStore()
  const active = usePageActive()

  const current = () => active.value && router.currentRoute.value.path === route.path

  function merged(query: LocationQuery, patch: Patch): LocationQueryRaw {
    const removed = new Set(Object.keys(patch).filter(key => patch[key] == null))
    return Object.fromEntries(
      Object.entries({ ...query, ...patch }).filter(([key]) => !removed.has(key)),
    )
  }

  function push(to: RouteLocationRaw) {
    if (current()) return navigateTo(to)
  }

  function replace(to: RouteLocationRaw) {
    if (current()) return navigateTo(to, { replace: true })
  }

  function back(fallback: string) {
    if (!current()) return
    if (previousPath()) return goBack(router)
    return router.replace(fallback)
  }

  function query(patch: Patch, mode: 'push' | 'replace' = 'push') {
    const to = { path: route.path, query: merged(route.query, patch), hash: route.hash }
    return mode === 'push' ? push(to) : replace(to)
  }

  function close(keys: string[]) {
    if (!current()) return
    const to = {
      path: route.path,
      query: merged(route.query, Object.fromEntries(keys.map(key => [key, null]))),
      hash: route.hash,
    }
    const last = previousPath()
    if (last && router.resolve(last).path === route.path) return goBack(router)
    return router.replace(to)
  }

  async function finish(to: string) {
    const origin = store.find(route.fullPath)?.id
    if (!origin) return
    const target = router.resolve(to)
    if (!current()) {
      store.retarget(origin, target.fullPath, (target.meta.title as string | undefined) ?? '')
      return
    }
    const failure = await router.replace(target.fullPath)
    if (!failure && store.activeId !== origin) store.close([origin])
  }

  return { current, push, replace, query, close, back, finish }
}
