import { defineStore, skipHydrate } from 'pinia'
import { changeCount, emptyDraft, type EditorDraft } from '~/features/wiki/editor/draft'

export interface StoredDraft extends EditorDraft {
  title: string
  path: string
  updated_at: string
  shown?: number
}

export const useWikiDraftsStore = defineStore('wiki-drafts', () => {
  const drafts = useLocalStorage<Record<string, StoredDraft>>(
    'hikari-wiki-drafts',
    {},
    { initOnMounted: true },
  )

  function update(
    key: string,
    page: { title: string; path: string },
    change: (draft: EditorDraft) => void,
  ) {
    const draft: StoredDraft = read(key) ?? { ...emptyDraft(), ...page, updated_at: '' }
    change(draft)
    if (!changeCount(draft) && !draft.note && !draft.basis.url && !draft.basis.media.length) {
      discard(key)
      return
    }
    drafts.value[key] = { ...draft, ...page, updated_at: new Date().toISOString() }
  }

  function discard(key: string) {
    const { [key]: _gone, ...rest } = drafts.value
    drafts.value = rest
  }

  function read(key: string): StoredDraft | undefined {
    const draft = drafts.value[key]
    return draft ? { ...emptyDraft(), ...draft } : undefined
  }

  function count(key: string) {
    const draft = read(key)
    return draft ? (draft.shown ?? changeCount(draft)) : 0
  }

  function show(key: string, shown: number) {
    const draft = drafts.value[key]
    if (draft && draft.shown !== shown) drafts.value[key] = { ...draft, shown }
  }

  return { drafts: skipHydrate(drafts), read, update, discard, count, show }
})
