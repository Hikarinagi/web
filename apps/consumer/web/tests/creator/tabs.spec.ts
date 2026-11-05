import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { tabKey, tabPath } from '~/features/creator/tabs'
import { useCreatorTabsStore } from '~/stores/creator-tabs'

describe('tabPath', () => {
  it('drops the dialogs a tab had open and keeps where it was', () => {
    expect(tabPath('/entries/1/edit/cast?side=hints&save=1&focus=4')).toBe(
      '/entries/1/edit/cast?side=hints&focus=4',
    )
    expect(tabPath('/entries/1/edit?close=edit%3A2&discard=1&check=1&find=1')).toBe(
      '/entries/1/edit',
    )
    expect(tabPath('/create/wiki/rules/A.7.1#A.7.1')).toBe('/create/wiki/rules/A.7.1#A.7.1')
  })
})

describe('creator tabs store', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  const open = (paths: string[]) => {
    const store = useCreatorTabsStore()
    for (const path of paths) store.visit(path, path)
    return store
  }

  it('reopens a closed tab where it was, at its last address, as a new page', () => {
    const store = open(['/create/wiki', '/entries/1/edit/cast?save=1', '/create/wiki/changes'])
    const before = store.pageKey('/entries/1/edit')
    store.close(['edit:1'])
    expect(store.tabs.map(tab => tab.key)).toEqual(['/create/wiki', 'changes'])
    expect(store.closed[0]).toMatchObject({ key: 'edit:1', path: '/entries/1/edit/cast', index: 1 })
    expect(store.reopen('edit:1')?.path).toBe('/entries/1/edit/cast')
    expect(store.tabs.map(tab => tab.key)).toEqual(['/create/wiki', 'edit:1', 'changes'])
    expect(store.closed).toEqual([])
    expect(store.pageKey('/entries/1/edit')).not.toBe(before)
  })

  it('keeps pinned tabs in front and moves tabs within their group', () => {
    const store = open(['/create/wiki', '/entries/1/edit', '/create/wiki/changes'])
    store.pin('changes', true)
    expect(store.tabs.map(tab => tab.key)).toEqual(['changes', '/create/wiki', 'edit:1'])
    store.move(2, 1)
    expect(store.tabs.map(tab => tab.key)).toEqual(['changes', 'edit:1', '/create/wiki'])
    store.pin('changes', false)
    expect(store.tabs.map(tab => [tab.key, Boolean(tab.pinned)])).toEqual([
      ['changes', false],
      ['edit:1', false],
      ['/create/wiki', false],
    ])
  })

  it('names a tab after its page even when the page names it first', () => {
    const store = useCreatorTabsStore()
    store.rename('edit:1', '見上げてごらん、夜空の星を', 'GAME')
    store.visit('/entries/1/edit', '编辑条目')
    expect(store.tabs[0]).toMatchObject({ title: '見上げてごらん、夜空の星を', kind: 'GAME' })
  })
})

describe('tabKey', () => {
  it('keeps every part and selection of one editor in the same tab', () => {
    expect(tabKey('/entries/25271/edit/basic')).toBe('edit:25271')
    expect(tabKey('/entries/25271/edit/releases/61022?focus=41')).toBe('edit:25271')
    expect(tabKey('/entries/25271/edit')).toBe('edit:25271')
  })

  it('gives the history and the merge of an entry tabs of their own', () => {
    expect(tabKey('/entries/25271/history/12')).toBe('history:25271')
    expect(tabKey('/entries/25271/merge/30001')).toBe('merge:25271')
  })

  it('keeps the change list with its details, and the rules with their clauses', () => {
    expect(tabKey('/create/wiki/changes?f=mine')).toBe('changes')
    expect(tabKey('/create/wiki/changes/801/undo')).toBe('changes')
    expect(tabKey('/create/wiki/rules/A.7.1')).toBe('rules')
  })

  it('opens any other page of the creator center as its own tab', () => {
    expect(tabKey('/create/wiki')).toBe('/create/wiki')
    expect(tabKey('/create/wiki/new?type=GAME')).toBe('/create/wiki/new')
    expect(tabKey('/create/projects/')).toBe('/create/projects')
  })
})
