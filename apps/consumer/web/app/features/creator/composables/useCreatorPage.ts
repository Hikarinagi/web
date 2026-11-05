import type { MaybeRefOrGetter } from 'vue'
import { currentPath, resourceKey } from '~/features/creator/tabs'

export interface CreatorCrumb {
  label: string
  to?: string
}

export function useCreatorCrumbs() {
  return useState<{ path: string; items: CreatorCrumb[] } | null>('creator-crumbs', () => null)
}

export function useCreatorPage(page: {
  title?: MaybeRefOrGetter<string | undefined>
  kind?: MaybeRefOrGetter<string | undefined>
  crumbs?: MaybeRefOrGetter<CreatorCrumb[] | undefined>
}) {
  if (import.meta.server) return
  const route = useRoute()
  const tabs = useCreatorTabsStore()
  const crumbs = useCreatorCrumbs()
  const active = usePageActive()
  watchEffect(() => {
    const tab = tabs.active
    if (!active.value || !tab) return
    if (resourceKey(currentPath(tab)) !== resourceKey(route.path)) return
    const title = toValue(page.title)
    if (title) tabs.rename(title, toValue(page.kind))
    const items = toValue(page.crumbs)
    if (items) crumbs.value = { path: route.path, items }
  })
}
