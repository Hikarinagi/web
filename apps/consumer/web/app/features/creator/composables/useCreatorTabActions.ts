import { toast } from '@hina-ui/vue'
import { resourceKey, type CreatorTab } from '~/features/creator/tabs'

export function useCreatorTabActions() {
  const store = useCreatorTabsStore()
  const drafts = useWikiDraftsStore()
  const route = useRoute()
  const router = useRouter()
  const nav = useTabNav()
  const { copy: copyText } = useClipboard({ legacy: true })
  const dirty = (tab: CreatorTab) => drafts.count(resourceKey(tab.path)) > 0

  async function remove(ids: string[]) {
    if (!ids.length) return
    const current = ids.includes(store.activeId)
    const next = current ? store.successor(ids) : undefined
    store.close(ids)
    if (!current) return
    if (next) await nav.leave(next)
    else await router.replace('/create/wiki')
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
    const tab = store.closed.find(item => item.id === id)
    if (tab) void router.push(tab.path)
  }

  async function copy(tab: CreatorTab) {
    await copyText(new URL(tab.path, window.location.origin).toString())
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
