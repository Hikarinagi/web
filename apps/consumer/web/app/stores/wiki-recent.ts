import { defineStore, skipHydrate } from 'pinia'
import type { EditableEntry, ValueDraft } from '~/features/wiki/editor/draft'

export interface RecentEntry {
  id: number
  type: EditableEntry['type']
  label: string
  image: ValueDraft['media']
}

const KEY = 'hikari-wiki-recent'

function parse(text: string | null): RecentEntry[] {
  if (!text) return []
  try {
    const value = JSON.parse(text) as unknown
    return Array.isArray(value) ? (value as RecentEntry[]) : []
  } catch {
    return []
  }
}

export const useWikiRecentStore = defineStore('wiki-recent', () => {
  const entries = shallowRef<RecentEntry[]>([])
  const nuxtApp = useNuxtApp()

  function load() {
    try {
      entries.value = parse(localStorage.getItem(KEY))
    } catch {
      entries.value = []
    }
  }

  if (import.meta.client) {
    if (nuxtApp.isHydrating) nuxtApp.hooks.hookOnce('app:suspense:resolve', load)
    else load()
    useEventListener(window, 'storage', event => {
      if (event.storageArea === localStorage && (event.key === KEY || event.key === null)) load()
    })
  }

  function visit(entry: RecentEntry) {
    load()
    entries.value = [entry, ...entries.value.filter(item => item.id !== entry.id)].slice(0, 12)
    try {
      localStorage.setItem(KEY, JSON.stringify(entries.value))
    } catch {
      return
    }
  }

  return { entries: skipHydrate(entries), visit }
})
