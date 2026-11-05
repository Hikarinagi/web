import { defineStore, skipHydrate } from 'pinia'
import {
  TAB_HISTORY_LIMIT,
  currentPath,
  pinnedCount,
  resourceKey,
  tabPath,
  type ClosedTab,
  type CreatorTab,
} from '~/features/creator/tabs'

export const useCreatorTabsStore = defineStore('creator-tabs', () => {
  const local = { listenToStorageChanges: false }
  const tabs = useLocalStorage<CreatorTab[]>('hikari-creator-tab-list', [], local)
  const closed = useSessionStorage<ClosedTab[]>('hikari-creator-closed-tab-list', [], local)
  const activeId = useSessionStorage('hikari-creator-active-tab', '', local)
  const enteredId = shallowRef('')
  const pending = shallowRef<{ id: string; push: boolean } | null>(null)
  const travel = shallowRef<number | null>(null)
  const keys = new Map<string, string>()
  let first: { resource: string; key: string } | null = null
  let serial = 0

  const active = computed(() => tabs.value.find(tab => tab.id === activeId.value))

  function create(fullPath: string, title: string): CreatorTab {
    return { id: crypto.randomUUID(), history: [fullPath], index: 0, title }
  }

  function retitle(tab: CreatorTab, before: string, title: string) {
    if (resourceKey(before) === resourceKey(currentPath(tab))) return
    tab.title = title
    delete tab.kind
  }

  function push(tab: CreatorTab, fullPath: string, title: string) {
    const before = currentPath(tab)
    if (before === fullPath) return
    tab.history = [...tab.history.slice(0, tab.index + 1), fullPath].slice(-TAB_HISTORY_LIMIT)
    tab.index = tab.history.length - 1
    retitle(tab, before, title)
  }

  function replace(tab: CreatorTab, fullPath: string, title: string) {
    const before = currentPath(tab)
    tab.history[tab.index] = fullPath
    retitle(tab, before, title)
  }

  function open(fullPath: string, title = '') {
    const tab: CreatorTab = { ...create(fullPath, title), opener: activeId.value }
    const list = [...tabs.value]
    let at = list.findIndex(item => item.id === activeId.value)
    if (at < 0) at = list.length
    else {
      at = Math.max(at + 1, pinnedCount(list))
      while (list[at]?.opener === activeId.value) at += 1
    }
    list.splice(at, 0, tab)
    tabs.value = list
    return tab
  }

  function enter(fullPath: string, title: string) {
    const wanted = tabPath(fullPath)
    const found =
      (active.value && tabPath(currentPath(active.value)) === wanted ? active.value : null) ??
      tabs.value.find(tab => tabPath(currentPath(tab)) === wanted)
    if (found) {
      found.history[found.index] = fullPath
      activeId.value = found.id
      enteredId.value = found.id
      return
    }
    const tab = create(fullPath, title)
    tabs.value = [...tabs.value, tab]
    activeId.value = tab.id
    enteredId.value = tab.id
  }

  function settle(fullPath: string, delta: number, title: string) {
    const target = pending.value
    pending.value = null
    const chosen = target && tabs.value.find(tab => tab.id === target.id)
    if (chosen) {
      activeId.value = chosen.id
      if (target.push) push(chosen, fullPath, title)
      else replace(chosen, fullPath, title)
      return
    }
    const tab = active.value
    if (!tab) return enter(fullPath, title)
    const index = travel.value
    travel.value = null
    if (index !== null && tab.history[index] !== undefined) {
      const before = currentPath(tab)
      tab.index = index
      tab.history[index] = fullPath
      retitle(tab, before, title)
    } else if (delta > 0) push(tab, fullPath, title)
    else replace(tab, fullPath, title)
  }

  function rename(title: string, kind?: string) {
    const tab = active.value
    if (!tab || !title) return
    tab.title = title
    if (kind) tab.kind = kind
    else delete tab.kind
  }

  function release(id: string) {
    for (const slot of [...keys.keys()]) if (slot.startsWith(`${id}|`)) keys.delete(slot)
  }

  function close(ids: string[]) {
    const gone = tabs.value
      .map((tab, position) => ({ ...tab, position }))
      .filter(tab => ids.includes(tab.id))
    closed.value = [...gone.reverse(), ...closed.value].slice(0, 10)
    for (const id of ids) release(id)
    tabs.value = tabs.value.filter(tab => !ids.includes(tab.id))
  }

  function reopen(id: string): CreatorTab | undefined {
    const found = closed.value.find(tab => tab.id === id)
    if (!found) return undefined
    closed.value = closed.value.filter(tab => tab.id !== id)
    const { position, ...rest } = found
    const tab: CreatorTab = { ...rest, id: crypto.randomUUID() }
    const list = [...tabs.value]
    const pinned = pinnedCount(list)
    const at = tab.pinned
      ? Math.min(position, pinned)
      : Math.min(Math.max(position, pinned), list.length)
    list.splice(at, 0, tab)
    tabs.value = list
    return tab
  }

  function pin(id: string, pinned: boolean) {
    const tab = tabs.value.find(item => item.id === id)
    if (!tab) return
    const rest = tabs.value.filter(item => item.id !== id)
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

  function pageKey(path: string) {
    const resource = resourceKey(path)
    const id = activeId.value
    if (!id) {
      first ??= { resource, key: `${resource}#0` }
      return first.resource === resource ? first.key : `${resource}#0`
    }
    const slot = `${id}|${resource}`
    let key = keys.get(slot)
    if (!key) {
      key = first?.resource === resource ? first.key : `${resource}#${++serial}`
      if (first?.resource === resource) first = null
      keys.set(slot, key)
    }
    return key
  }

  return {
    tabs: skipHydrate(tabs),
    closed: skipHydrate(closed),
    activeId: skipHydrate(activeId),
    enteredId,
    active,
    pending,
    travel,
    open,
    enter,
    settle,
    rename,
    close,
    reopen,
    pin,
    move,
    pageKey,
  }
})
