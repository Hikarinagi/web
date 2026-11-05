import { defineStore, skipHydrate } from 'pinia'
import { tabKey, type CreatorTab } from '~/features/creator/tabs'

export const useCreatorTabsStore = defineStore('creator-tabs', () => {
  const tabs = useLocalStorage<CreatorTab[]>('hikari-creator-tabs', [], { initOnMounted: true })

  const named = new Map<string, string>()

  function visit(path: string, title: string) {
    const key = tabKey(path)
    const open = tabs.value.find(tab => tab.key === key)
    const given = named.get(key)
    if (open) {
      open.path = path
      if (given) open.title = given
    } else tabs.value.push({ key, path, title: given ?? title })
  }

  function rename(key: string, title: string) {
    if (!title) return
    named.set(key, title)
    const open = tabs.value.find(tab => tab.key === key)
    if (open) open.title = title
  }

  function close(keys: string[]): void {
    tabs.value = tabs.value.filter(tab => !keys.includes(tab.key))
  }

  return { tabs: skipHydrate(tabs), visit, rename, close }
})
