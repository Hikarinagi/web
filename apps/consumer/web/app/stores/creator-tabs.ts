import { defineStore, skipHydrate } from 'pinia'
import {
  RECENT_LIMIT,
  pinnedCount,
  resourceKey,
  tabPath,
  type ClosedTab,
  type CreatorTab,
} from '~/features/creator/tabs'

export const useCreatorTabsStore = defineStore('creator-tabs', () => {
  const local = { listenToStorageChanges: false }
  const tabs = useSessionStorage<CreatorTab[]>('hikari-creator-tabs', [], local)
  const closed = useSessionStorage<ClosedTab[]>('hikari-creator-closed-tabs', [], local)
  const recent = useSessionStorage<string[]>('hikari-creator-recent-tabs', [], local)
  const here = shallowRef('')
  const generations = new Map<string, number>()
  const stale = new Set<string>()

  const find = (path: string) => {
    const resource = resourceKey(path)
    return tabs.value.find(tab => resourceKey(tab.path) === resource)
  }
  const active = computed(() => (here.value ? find(here.value) : undefined))
  const activeId = computed(() => active.value?.id ?? '')

  function place(tab: CreatorTab, opener: string) {
    const list = [...tabs.value]
    let at = list.findIndex(item => item.id === opener)
    if (at < 0) at = list.length
    else {
      at = Math.max(at + 1, pinnedCount(list))
      while (list[at]?.opener === opener) at += 1
    }
    list.splice(at, 0, tab)
    tabs.value = list
  }

  function revive(path: string) {
    const resource = resourceKey(path)
    const found = closed.value.find(tab => resourceKey(tab.path) === resource)
    if (!found) return false
    closed.value = closed.value.filter(tab => tab.id !== found.id)
    const { position, ...rest } = found
    const list = [...tabs.value]
    const pinned = pinnedCount(list)
    const at = rest.pinned
      ? Math.min(position, pinned)
      : Math.min(Math.max(position, pinned), list.length)
    list.splice(at, 0, { ...rest, path })
    tabs.value = list
    return true
  }

  function create(path: string, title: string, opener: string) {
    const resource = resourceKey(path)
    if (stale.delete(resource)) generations.set(resource, (generations.get(resource) ?? 0) + 1)
    if (!revive(path)) place({ id: crypto.randomUUID(), path, title, opener }, opener)
  }

  function visit(fullPath: string, title: string) {
    const path = tabPath(fullPath)
    const opener = activeId.value
    here.value = path
    const tab = find(path)
    if (tab) tab.path = path
    else create(path, title, opener)
    const id = activeId.value
    if (id && recent.value[0] !== id)
      recent.value = [id, ...recent.value.filter(item => item !== id)].slice(0, RECENT_LIMIT)
  }

  function open(fullPath: string, title: string) {
    const path = tabPath(fullPath)
    const tab = find(path)
    if (tab) tab.path = path
    else create(path, title, activeId.value)
  }

  function rename(title: string, kind?: string) {
    const tab = active.value
    if (!tab || !title) return
    tab.title = title
    if (kind) tab.kind = kind
    else delete tab.kind
  }

  function successor(ids: string[]) {
    const left = tabs.value.filter(tab => !ids.includes(tab.id))
    return recent.value.map(id => left.find(tab => tab.id === id)).find(Boolean) ?? left[0]
  }

  function close(ids: string[]) {
    const gone = tabs.value
      .map((tab, position) => ({ ...tab, position }))
      .filter(tab => ids.includes(tab.id))
    const resources = new Set(gone.map(tab => resourceKey(tab.path)))
    for (const resource of resources) stale.add(resource)
    closed.value = [
      ...gone.reverse(),
      ...closed.value.filter(tab => !resources.has(resourceKey(tab.path))),
    ].slice(0, 10)
    tabs.value = tabs.value.filter(tab => !ids.includes(tab.id))
    recent.value = recent.value.filter(id => !ids.includes(id))
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
    return `${resource}#${generations.get(resource) ?? 0}`
  }

  return {
    tabs: skipHydrate(tabs),
    closed: skipHydrate(closed),
    active,
    activeId,
    find,
    visit,
    open,
    rename,
    successor,
    close,
    pin,
    move,
    pageKey,
  }
})
