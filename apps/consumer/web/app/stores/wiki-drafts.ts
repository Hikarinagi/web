import { defineStore, skipHydrate } from 'pinia'
import { changeCount, emptyDraft, type EditorDraft } from '~/features/wiki/editor/draft'

export interface StoredDraft extends EditorDraft {
  title: string
  path: string
  updated_at: string
  shown?: number
}

const PREFIX = 'hikari-wiki-draft:'
const LEGACY = 'hikari-wiki-drafts'
const known = (key: string) => /^edit:\d+$/.test(key) || key === '/create/wiki/new'

function parse(text: string | null): StoredDraft | null {
  if (!text) return null
  try {
    const value = JSON.parse(text) as StoredDraft | null
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

function persist(key: string, draft: StoredDraft | null) {
  try {
    if (draft) localStorage.setItem(PREFIX + key, JSON.stringify(draft))
    else localStorage.removeItem(PREFIX + key)
  } catch {
    return
  }
}

export const useWikiDraftsStore = defineStore('wiki-drafts', () => {
  const drafts = ref<Record<string, StoredDraft>>({})
  const nuxtApp = useNuxtApp()
  let loaded = false

  function load() {
    if (loaded) return
    loaded = true
    const found: Record<string, StoredDraft> = {}
    try {
      const legacy = parse(localStorage.getItem(LEGACY)) as Record<string, StoredDraft> | null
      for (const [key, draft] of Object.entries(legacy ?? {}))
        if (known(key) && !localStorage.getItem(PREFIX + key)) persist(key, draft)
      localStorage.removeItem(LEGACY)
      for (let index = localStorage.length - 1; index >= 0; index--) {
        const name = localStorage.key(index)
        if (!name?.startsWith(PREFIX)) continue
        const key = name.slice(PREFIX.length)
        const draft = parse(localStorage.getItem(name))
        if (draft && known(key)) found[key] = draft
        else localStorage.removeItem(name)
      }
    } catch {
      return
    }
    drafts.value = found
  }

  function put(key: string, draft: StoredDraft | null) {
    const { [key]: _old, ...rest } = drafts.value
    drafts.value = draft ? { ...rest, [key]: draft } : rest
  }

  if (import.meta.client) {
    if (nuxtApp.isHydrating) nuxtApp.hooks.hookOnce('app:suspense:resolve', load)
    else load()
    useEventListener(window, 'storage', event => {
      if (event.storageArea !== localStorage) return
      if (event.key === null) {
        loaded = false
        load()
        return
      }
      if (!event.key.startsWith(PREFIX)) return
      const key = event.key.slice(PREFIX.length)
      const draft = parse(event.newValue)
      put(key, draft && known(key) ? draft : null)
    })
  }

  function write(key: string, draft: StoredDraft | null) {
    load()
    put(key, draft)
    persist(key, draft)
  }

  function update(
    key: string,
    page: { title: string; path: string },
    change: (draft: EditorDraft) => void,
  ) {
    load()
    const draft: StoredDraft = read(key) ?? { ...emptyDraft(), ...page, updated_at: '' }
    change(draft)
    if (!changeCount(draft) && !draft.note && !draft.basis.url && !draft.basis.media.length) {
      write(key, null)
      return
    }
    write(key, { ...draft, ...page, updated_at: new Date().toISOString() })
  }

  function discard(key: string) {
    write(key, null)
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
    if (draft && draft.shown !== shown) write(key, { ...draft, shown })
  }

  return { drafts: skipHydrate(drafts), read, update, discard, count, show }
})
