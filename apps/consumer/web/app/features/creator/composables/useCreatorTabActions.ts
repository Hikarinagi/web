import { toast } from '@hina-ui/vue'
import { tabKey, type CreatorTab } from '~/features/creator/tabs'

export function useCreatorTabActions() {
  const store = useCreatorTabsStore()
  const drafts = useWikiDraftsStore()
  const route = useRoute()
  const router = useRouter()
  const { copy: copyText } = useClipboard({ legacy: true })
  const active = computed(() => tabKey(route.path))
  const dirty = (key: string) => drafts.count(key) > 0

  async function remove(keys: string[]) {
    if (!keys.length) return
    if (keys.includes(active.value)) {
      const index = store.tabs.findIndex(tab => tab.key === active.value)
      const rest = store.tabs.filter(tab => !keys.includes(tab.key))
      const next = rest[Math.min(index, rest.length - 1)]
      await navigateTo(next?.path ?? '/create')
    }
    store.close(keys)
  }

  function close(key: string) {
    if (dirty(key)) {
      void router.replace({ query: { ...route.query, close: key } })
      return
    }
    void remove([key])
  }

  function closeMany(keys: string[]) {
    const tabs = store.tabs.filter(tab => keys.includes(tab.key))
    const kept = tabs.filter(tab => tab.pinned || dirty(tab.key))
    if (kept.length) toast.info(`${kept.length} 个标签页没有关闭`)
    void remove(tabs.filter(tab => !kept.includes(tab)).map(tab => tab.key))
  }

  function reopen(key = store.closed[0]?.key) {
    if (!key) return
    const tab = store.reopen(key)
    if (tab) void navigateTo(tab.path)
  }

  async function copy(tab: CreatorTab) {
    await copyText(new URL(tab.path, window.location.origin).toString())
    toast.success('已复制链接')
  }

  return {
    active,
    dirty,
    remove,
    close,
    closeMany,
    reopen,
    copy,
    open: (tab: CreatorTab) => navigateTo(tab.path),
    pin: (key: string, pinned: boolean) => store.pin(key, pinned),
  }
}
