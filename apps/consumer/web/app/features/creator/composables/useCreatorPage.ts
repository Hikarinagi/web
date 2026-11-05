import type { MaybeRefOrGetter } from 'vue'
import { tabKey } from '~/features/creator/tabs'

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
    const title = toValue(page.title)
    if (title) tabs.rename(tabKey(route.path), title, toValue(page.kind))
    if (!active.value) return
    const items = toValue(page.crumbs)
    if (items) crumbs.value = { path: route.path, items }
  })
}
