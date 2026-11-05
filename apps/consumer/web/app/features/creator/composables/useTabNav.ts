import type { RouteLocationRaw } from 'vue-router'
import { currentPath, resourceKey, samePlace, type CreatorTab } from '~/features/creator/tabs'

export function useTabNav() {
  const store = useCreatorTabsStore()
  const router = useRouter()

  const canBack = computed(() => (store.active?.index ?? 0) > 0)
  const canForward = computed(() => {
    const tab = store.active
    return Boolean(tab && tab.index < tab.history.length - 1)
  })

  function visit(fullPath: string) {
    const target = router.resolve(fullPath)
    return router.replace({
      path: target.path,
      query: target.query,
      hash: target.hash,
      force: true,
    })
  }

  function go(delta: number) {
    const tab = store.active
    const index = (tab?.index ?? 0) + delta
    const target = tab?.history[index]
    if (!target) return
    store.travel = index
    return visit(target)
  }

  function dismiss(to: RouteLocationRaw, loose = false) {
    const tab = store.active
    const wanted = router.resolve(to).fullPath
    const previous = tab?.history[tab.index - 1]
    const same = (a: string) =>
      loose ? resourceKey(a) === resourceKey(wanted) : samePlace(a, wanted)
    if (previous && same(previous)) return go(-1)
    return router.replace(to)
  }

  function activate(tab: CreatorTab, push = false) {
    if (tab.id === store.activeId && !push) return
    store.pending = { id: tab.id, push }
    return visit(currentPath(tab))
  }

  function open(path: string, focus: boolean) {
    const target = router.resolve(path)
    const tab = store.open(target.fullPath, (target.meta.title as string | undefined) ?? '')
    if (focus) return activate(tab)
  }

  async function finish(path: string) {
    const from = store.activeId
    await router.push(path)
    if (store.activeId !== from) store.close([from])
  }

  return {
    canBack,
    canForward,
    back: () => go(-1),
    forward: () => go(1),
    dismiss,
    activate,
    open,
    finish,
  }
}
