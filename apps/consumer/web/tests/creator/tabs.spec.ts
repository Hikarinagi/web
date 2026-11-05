import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { currentPath, resourceKey, samePlace, tabPath } from '~/features/creator/tabs'
import { useCreatorTabsStore } from '~/stores/creator-tabs'

describe('tabPath', () => {
  it('drops the dialogs a tab had open and keeps where it was', () => {
    expect(tabPath('/entries/1/edit/cast?side=hints&save=1&focus=4')).toBe(
      '/entries/1/edit/cast?side=hints&focus=4',
    )
    expect(tabPath('/entries/1/edit?close=abc&discard=1&check=1&find=1')).toBe('/entries/1/edit')
    expect(tabPath('/create/wiki/rules/A.7.1#A.7.1')).toBe('/create/wiki/rules/A.7.1#A.7.1')
  })
})

describe('samePlace', () => {
  it('reads two addresses as one place whatever the order of their query', () => {
    expect(
      samePlace('/entries/1/edit?side=refs&focus=3', '/entries/1/edit/?focus=3&side=refs'),
    ).toBe(true)
    expect(samePlace('/entries/1/edit', '/entries/1/edit?save=1')).toBe(false)
  })
})

describe('resourceKey', () => {
  it('puts the parts of one editor, history or list under one key', () => {
    expect(resourceKey('/entries/25271/edit/releases/61022?focus=41')).toBe('edit:25271')
    expect(resourceKey('/entries/25271/history/12')).toBe('history:25271')
    expect(resourceKey('/create/wiki/changes/801/undo')).toBe('changes')
    expect(resourceKey('/create/wiki/new?type=GAME')).toBe('/create/wiki/new')
  })
})

describe('creator tabs store', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it('keeps the steps taken in a tab and goes back and forth only within it', () => {
    const store = useCreatorTabsStore()
    store.enter('/create/wiki/changes', '全部修改')
    store.settle('/create/wiki/changes/5', 1, '修改详情')
    store.settle('/entries/1/edit', 1, '编辑条目')
    const first = store.active!
    expect(first.history).toEqual([
      '/create/wiki/changes',
      '/create/wiki/changes/5',
      '/entries/1/edit',
    ])
    const other = store.open('/entries/2/edit', '编辑条目')
    expect(store.tabs.map(tab => tab.id)).toEqual([first.id, other.id])
    expect(store.activeId).toBe(first.id)
    store.pending = { id: other.id, push: false }
    store.settle('/entries/2/edit', 0, '编辑条目')
    expect(store.activeId).toBe(other.id)
    expect(other.history).toEqual(['/entries/2/edit'])
    store.pending = { id: first.id, push: false }
    store.settle('/entries/1/edit', 0, '编辑条目')
    store.travel = 1
    store.settle('/create/wiki/changes/5', -1, '修改详情')
    expect(currentPath(first)).toBe('/create/wiki/changes/5')
    expect(first.history).toHaveLength(3)
    store.settle('/create/wiki/changes/6', 1, '修改详情')
    expect(first.history).toEqual([
      '/create/wiki/changes',
      '/create/wiki/changes/5',
      '/create/wiki/changes/6',
    ])
  })

  it('replaces the step a dialog took and keeps the title within one page', () => {
    const store = useCreatorTabsStore()
    store.enter('/entries/1/edit', '编辑条目')
    store.rename('見上げてごらん、夜空の星を', 'GAME')
    store.settle('/entries/1/edit/cast', 1, '编辑条目')
    store.settle('/entries/1/edit/cast?save=1', 1, '编辑条目')
    store.settle('/entries/1/edit/cast?saved=9', 0, '编辑条目')
    expect(store.active).toMatchObject({
      history: ['/entries/1/edit', '/entries/1/edit/cast', '/entries/1/edit/cast?saved=9'],
      title: '見上げてごらん、夜空の星を',
      kind: 'GAME',
    })
    store.settle('/create/wiki/rules', 1, '编辑规范')
    expect(store.active).toMatchObject({ title: '编辑规范' })
    expect(store.active?.kind).toBeUndefined()
  })

  it('opens an address from outside in the tab already there or in a new one', () => {
    const store = useCreatorTabsStore()
    store.enter('/create/wiki', '维基工作台')
    const home = store.activeId
    store.enter('/entries/1/edit', '编辑条目')
    expect(store.tabs).toHaveLength(2)
    store.enter('/create/wiki?save=1', '维基工作台')
    expect(store.activeId).toBe(home)
    expect(store.tabs).toHaveLength(2)
  })

  it('gives each tab its own page and keeps the first page it rendered', () => {
    const store = useCreatorTabsStore()
    const before = store.pageKey('/entries/1/edit')
    store.enter('/entries/1/edit', '编辑条目')
    expect(store.pageKey('/entries/1/edit/cast')).toBe(before)
    const other = store.open('/entries/1/edit', '编辑条目')
    store.pending = { id: other.id, push: false }
    store.settle('/entries/1/edit', 0, '编辑条目')
    expect(store.pageKey('/entries/1/edit')).not.toBe(before)
  })

  it('reopens a closed tab with its steps as a new tab, and keeps pinned tabs in front', () => {
    const store = useCreatorTabsStore()
    store.enter('/create/wiki', '维基工作台')
    store.enter('/entries/1/edit', '编辑条目')
    store.settle('/entries/1/edit/cast', 1, '编辑条目')
    const closed = store.activeId
    store.enter('/create/wiki/changes', '全部修改')
    store.close([closed])
    expect(store.tabs).toHaveLength(2)
    expect(store.closed[0]).toMatchObject({ id: closed, position: 1, index: 1 })
    const reopened = store.reopen(closed)
    expect(reopened?.id).not.toBe(closed)
    expect(reopened?.history).toEqual(['/entries/1/edit', '/entries/1/edit/cast'])
    expect(store.tabs.map(tab => tab.id).indexOf(reopened!.id)).toBe(1)
    const last = store.tabs[2]!.id
    store.pin(last, true)
    expect(store.tabs[0]!.id).toBe(last)
  })
})
