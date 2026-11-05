import { defineStore, skipHydrate } from 'pinia'
import type { EditableEntry, ValueDraft } from '~/features/wiki/editor/draft'

export interface RecentEntry {
  id: number
  type: EditableEntry['type']
  label: string
  image: ValueDraft['media']
}

export const useWikiRecentStore = defineStore('wiki-recent', () => {
  const entries = useLocalStorage<RecentEntry[]>('hikari-wiki-recent', [], {
    initOnMounted: true,
  })

  function visit(entry: RecentEntry) {
    entries.value = [entry, ...entries.value.filter(item => item.id !== entry.id)].slice(0, 12)
  }

  return { entries: skipHydrate(entries), visit }
})
