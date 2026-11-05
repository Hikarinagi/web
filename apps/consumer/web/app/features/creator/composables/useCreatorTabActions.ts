import { toast } from '@hina-ui/vue'
import { currentPath, resourceKey, tabPath, type CreatorTab } from '~/features/creator/tabs'

export function useCreatorTabActions() {
  const store = useCreatorTabsStore()
  const drafts = useWikiDraftsStore()
  const route = useRoute()
  const router = useRouter()
  const nav = useTabNav()
  const { copy: copyText } = useClipboard({ legacy: true })
  const dirty = (tab: CreatorTab) => drafts.count(resourceKey(currentPath(tab))) > 0

  async function remove(ids: string[]) {
    if (!ids.length) return
    if (ids.includes(store.activeId)) {
      const index = store.tabs.findIndex(tab => tab.id === store.activeId)
      const rest = store.tabs.filter(tab => !ids.includes(tab.id))
      const next = rest[Math.min(index, rest.length - 1)]
      if (next) await nav.activate(next)
      else await nav.open('/create/wiki', true)
    }
    store.close(ids)
  }

  function close(tab: CreatorTab) {
    if (dirty(tab)) {
      void router.push({ query: { ...route.query, close: tab.id } })
      return
    }
    void remove([tab.id])
  }

  function closeMany(ids: string[]) {
    const tabs = store.tabs.filter(tab => ids.includes(tab.id))
    const kept = tabs.filter(tab => tab.pinned || dirty(tab))
    if (kept.length) toast.info(`${kept.length} 个标签页没有关闭`)
    void remove(tabs.filter(tab => !kept.includes(tab)).map(tab => tab.id))
  }

  function reopen(id = store.closed[0]?.id) {
    if (!id) return
    const tab = store.reopen(id)
    if (tab) void nav.activate(tab)
  }

  async function copy(tab: CreatorTab) {
    await copyText(new URL(tabPath(currentPath(tab)), window.location.origin).toString())
    toast.success('已复制链接')
  }

  return {
    dirty,
    remove,
    close,
    closeMany,
    reopen,
    copy,
    open: (tab: CreatorTab) => nav.activate(tab),
    pin: (id: string, pinned: boolean) => store.pin(id, pinned),
  }
}
