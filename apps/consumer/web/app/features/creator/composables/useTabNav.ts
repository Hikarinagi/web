import type { RouteLocationRaw } from 'vue-router'
import { resourceKey, samePlace, type CreatorTab } from '~/features/creator/tabs'

export function useTabNav() {
  const store = useCreatorTabsStore()
  const router = useRouter()

  function back() {
    return new Promise<void>(resolve => {
      const stop = router.afterEach(() => {
        stop()
        resolve()
      })
      router.back()
    })
  }

  function previous() {
    const state = import.meta.client ? window.history.state : null
    return typeof state?.back === 'string' ? (state.back as string) : null
  }

  function dismiss(to: RouteLocationRaw, loose = false) {
    const wanted = router.resolve(to).fullPath
    const last = previous()
    const same = (path: string) =>
      loose ? resourceKey(path) === resourceKey(wanted) : samePlace(path, wanted)
    if (last && same(last)) return back()
    return router.replace(to)
  }

  function activate(tab: CreatorTab) {
    if (tab.id === store.activeId) return
    return router.push(tab.path)
  }

  function leave(tab: CreatorTab) {
    const last = previous()
    if (last && resourceKey(last) === resourceKey(tab.path)) return back()
    return router.replace(tab.path)
  }

  function open(path: string, focus: boolean) {
    const target = router.resolve(path)
    if (focus || resourceKey(target.fullPath) === resourceKey(router.currentRoute.value.fullPath))
      return router.push(target.fullPath)
    store.open(target.fullPath, (target.meta.title as string | undefined) ?? '')
  }

  async function finish(path: string) {
    const from = store.activeId
    await router.replace(path)
    if (from && store.activeId !== from) store.close([from])
  }

  return { dismiss, activate, leave, open, finish }
}
