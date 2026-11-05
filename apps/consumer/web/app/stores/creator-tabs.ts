import { defineStore, skipHydrate } from 'pinia'
import {
  pinnedCount,
  tabKey,
  tabPath,
  type ClosedTab,
  type CreatorTab,
} from '~/features/creator/tabs'

export const useCreatorTabsStore = defineStore('creator-tabs', () => {
  const tabs = useLocalStorage<CreatorTab[]>('hikari-creator-tabs', [], { initOnMounted: true })
  const closed = useSessionStorage<ClosedTab[]>('hikari-creator-closed-tabs', [], {
    initOnMounted: true,
  })
  const generations = reactive<Record<string, number>>({})
  const named = new Map<string, { title: string; kind?: string }>()

  function visit(fullPath: string, title: string) {
    const key = tabKey(fullPath)
    const path = tabPath(fullPath)
    const open = tabs.value.find(tab => tab.key === key)
    const given = named.get(key)
    if (open) {
      open.path = path
      if (given) Object.assign(open, given)
    } else tabs.value.push({ key, path, title, ...given })
  }

  function rename(key: string, title: string, kind?: string) {
    if (!title) return
    const given = { title, ...(kind ? { kind } : {}) }
    named.set(key, given)
    const open = tabs.value.find(tab => tab.key === key)
    if (open) Object.assign(open, given)
  }

  function close(keys: string[]) {
    const gone = tabs.value
      .map((tab, index) => ({ ...tab, index }))
      .filter(tab => keys.includes(tab.key))
    closed.value = [
      ...gone.reverse(),
      ...closed.value.filter(tab => !keys.includes(tab.key)),
    ].slice(0, 10)
    for (const key of keys) generations[key] = (generations[key] ?? 0) + 1
    tabs.value = tabs.value.filter(tab => !keys.includes(tab.key))
  }

  function reopen(key: string): CreatorTab | undefined {
    const found = closed.value.find(tab => tab.key === key)
    if (!found) return undefined
    closed.value = closed.value.filter(tab => tab.key !== key)
    const { index, ...tab } = found
    if (tabs.value.some(item => item.key === key)) return tab
    const list = [...tabs.value]
    const pinned = pinnedCount(list)
    const at = tab.pinned ? Math.min(index, pinned) : Math.min(Math.max(index, pinned), list.length)
    list.splice(at, 0, tab)
    tabs.value = list
    return tab
  }

  function pin(key: string, pinned: boolean) {
    const tab = tabs.value.find(item => item.key === key)
    if (!tab) return
    const rest = tabs.value.filter(item => item.key !== key)
    const { pinned: _was, ...plain } = tab
    rest.splice(pinnedCount(rest), 0, pinned ? { ...plain, pinned: true } : plain)
    tabs.value = rest
  }

  function move(from: number, to: number) {
    const list = [...tabs.value]
    const [tab] = list.splice(from, 1)
    if (!tab) return
    list.splice(to, 0, tab)
    tabs.value = list
  }

  const pageKey = (path: string) => {
    const key = tabKey(path)
    return `${key}#${generations[key] ?? 0}`
  }

  return {
    tabs: skipHydrate(tabs),
    closed: skipHydrate(closed),
    visit,
    rename,
    close,
    reopen,
    pin,
    move,
    pageKey,
  }
})
