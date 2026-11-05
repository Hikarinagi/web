import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyDraft } from '~/features/wiki/editor/draft'
import { useWikiDraftsStore } from '~/stores/wiki-drafts'

const page = { title: '見上げてごらん、夜空の星を', path: '/entries/1/edit' }
const stored = (note: string) => ({ ...emptyDraft(), ...page, note, updated_at: '2026-11-05' })

describe('wiki drafts store', () => {
  vi.stubGlobal('useNuxtApp', () => ({ isHydrating: false, hooks: { hookOnce: vi.fn() } }))

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('splits the old single record into one record for each entry and drops what it does not know', () => {
    localStorage.setItem(
      'hikari-wiki-drafts',
      JSON.stringify({
        'edit:1': stored('甲'),
        '/entries/2/edit': stored('乙'),
        '/create/wiki/new': stored('丙'),
      }),
    )
    localStorage.setItem('hikari-wiki-draft:history:3', JSON.stringify(stored('丁')))
    const store = useWikiDraftsStore()
    expect(Object.keys(store.drafts).sort()).toEqual(['/create/wiki/new', 'edit:1'])
    expect(localStorage.getItem('hikari-wiki-drafts')).toBeNull()
    expect(localStorage.getItem('hikari-wiki-draft:history:3')).toBeNull()
    expect(JSON.parse(localStorage.getItem('hikari-wiki-draft:edit:1')!).note).toBe('甲')
  })

  it('writes each change to its own entry at once', () => {
    const store = useWikiDraftsStore()
    store.update('edit:2', page, draft => {
      draft.note = '补来源'
    })
    expect(JSON.parse(localStorage.getItem('hikari-wiki-draft:edit:2')!).note).toBe('补来源')
    store.discard('edit:2')
    expect(localStorage.getItem('hikari-wiki-draft:edit:2')).toBeNull()
    expect(store.read('edit:2')).toBeUndefined()
  })

  it('takes in what another window wrote without losing its own entries', () => {
    const store = useWikiDraftsStore()
    store.update('edit:2', page, draft => {
      draft.note = '本窗口'
    })
    const other = JSON.stringify(stored('另一个窗口'))
    localStorage.setItem('hikari-wiki-draft:edit:3', other)
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'hikari-wiki-draft:edit:3',
        newValue: other,
        storageArea: localStorage,
      }),
    )
    expect(store.read('edit:3')?.note).toBe('另一个窗口')
    expect(store.read('edit:2')?.note).toBe('本窗口')
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'hikari-wiki-draft:edit:3',
        newValue: null,
        storageArea: localStorage,
      }),
    )
    expect(store.read('edit:3')).toBeUndefined()
  })
})
