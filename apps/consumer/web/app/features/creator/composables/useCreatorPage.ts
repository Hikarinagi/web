import type { MaybeRefOrGetter } from 'vue'
import { resourceKey } from '~/features/creator/tabs'

export interface CreatorCrumb {
  label: string
  to?: string
}

export function useCreatorCrumbs() {
  return useState<{ path: string; items: CreatorCrumb[] } | null>('creator-crumbs', () => null)
}

const loadingPages = shallowReactive(new Map<number, string>())
let serial = 0

export function useCreatorLoading(): ReadonlyMap<number, string> {
  return loadingPages
}

export function useCreatorPage(page: {
  title?: MaybeRefOrGetter<string | undefined>
  kind?: MaybeRefOrGetter<string | undefined>
  crumbs?: MaybeRefOrGetter<CreatorCrumb[] | undefined>
  loading?: MaybeRefOrGetter<boolean>
}) {
  if (import.meta.server) return
  const route = useRoute()
  const tabs = useCreatorTabsStore()
  const crumbs = useCreatorCrumbs()
  const active = usePageActive()
  const id = ++serial
  watchEffect(() => {
    if (active.value && toValue(page.loading)) loadingPages.set(id, route.path)
    else loadingPages.delete(id)
  })
  onScopeDispose(() => loadingPages.delete(id))
  watchEffect(() => {
    const title = toValue(page.title)
    if (title) tabs.rename(route.path, title, toValue(page.kind))
  })
  watchEffect(() => {
    const tab = tabs.active
    if (!active.value || !tab) return
    if (resourceKey(tab.path) !== resourceKey(route.path)) return
    const items = toValue(page.crumbs)
    if (items) crumbs.value = { path: route.path, items }
  })
}
