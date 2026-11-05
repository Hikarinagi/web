import { goBack, previousPath } from '~/features/creator/history'
import { resourceKey, type CreatorTab } from '~/features/creator/tabs'

export function useTabNav() {
  const store = useCreatorTabsStore()
  const router = useRouter()
  const request = useRequestFetch()

  function activate(tab: CreatorTab) {
    if (tab.id === store.activeId) return
    return router.push(tab.path)
  }

  function leave(tab: CreatorTab) {
    const last = previousPath()
    if (last && resourceKey(last) === resourceKey(tab.path)) return goBack(router)
    return router.replace(tab.path)
  }

  async function open(path: string, focus: boolean) {
    if (focus) return router.push(path)
    const target = await resolveTarget(router.resolve(path).fullPath)
    if (resourceKey(target) === resourceKey(router.currentRoute.value.fullPath))
      return router.push(target)
    const resolved = router.resolve(target)
    store.open(resolved.fullPath, (resolved.meta.title as string | undefined) ?? '')
  }

  async function resolveTarget(fullPath: string) {
    const match = /^\/entries\/(\d+)\/edit(?:[/?#]|$)/.exec(fullPath)
    if (!match) return fullPath
    const found = await request<{ target: string | null }>(
      `/api/pages/entries/${match[1]}/target`,
    ).catch(() => null)
    return found?.target ?? fullPath
  }

  function create() {
    store.expect('/create/wiki', 'end')
    return router.push('/create/wiki')
  }

  return { activate, leave, open, create }
}
