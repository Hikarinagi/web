import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { resourceKey, samePlace, tabPath } from '~/features/creator/tabs'
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
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it('follows the address, keeping one tab for each content and where it was left', () => {
    const store = useCreatorTabsStore()
    store.visit('/create/wiki/changes', '全部修改')
    const changes = store.activeId
    store.visit('/create/wiki/changes/5?save=1', '修改详情')
    expect(store.tabs).toHaveLength(1)
    expect(store.active?.path).toBe('/create/wiki/changes/5')
    store.visit('/entries/1/edit', '编辑条目')
    store.visit('/entries/1/edit/cast', '编辑条目')
    expect(store.tabs.map(tab => tab.path)).toEqual([
      '/create/wiki/changes/5',
      '/entries/1/edit/cast',
    ])
    store.visit('/create/wiki/changes/5', '修改详情')
    expect(store.activeId).toBe(changes)
    expect(store.tabs).toHaveLength(2)
  })

  it('opens a tab beside the one it came from and does not open the same content twice', () => {
    const store = useCreatorTabsStore()
    store.visit('/create/wiki', '维基工作台')
    store.visit('/create/wiki/rules', '编辑规范')
    store.visit('/create/wiki', '维基工作台')
    store.open('/entries/1/edit', '编辑条目')
    store.open('/entries/2/edit', '编辑条目')
    store.open('/entries/1/edit/cast', '编辑条目')
    expect(store.tabs.map(tab => tab.path)).toEqual([
      '/create/wiki',
      '/create/wiki/rules',
      '/entries/1/edit/cast',
      '/entries/2/edit',
    ])
    expect(store.active?.path).toBe('/create/wiki')
  })

  it('keeps the title a page gave its tab until the tab turns to other content', () => {
    const store = useCreatorTabsStore()
    store.visit('/entries/1/edit', '编辑条目')
    store.rename('見上げてごらん、夜空の星を', 'GAME')
    store.visit('/entries/1/edit/cast?saved=9', '编辑条目')
    expect(store.active).toMatchObject({ title: '見上げてごらん、夜空の星を', kind: 'GAME' })
  })

  it('hands over to the tab seen last when the current one closes', () => {
    const store = useCreatorTabsStore()
    store.visit('/create/wiki', '维基工作台')
    store.visit('/create/wiki/rules', '编辑规范')
    store.visit('/entries/1/edit', '编辑条目')
    const rules = store.tabs[1]!.id
    store.visit('/create/wiki/rules', '编辑规范')
    store.visit('/entries/1/edit', '编辑条目')
    expect(store.successor([store.activeId])?.id).toBe(rules)
  })

  it('brings a closed tab back where it was with a fresh page when its content is visited again', () => {
    const store = useCreatorTabsStore()
    store.visit('/create/wiki', '维基工作台')
    store.visit('/entries/1/edit', '编辑条目')
    store.rename('見上げてごらん、夜空の星を', 'GAME')
    store.visit('/create/wiki/changes', '全部修改')
    const page = store.pageKey('/entries/1/edit')
    const closed = store.tabs[1]!.id
    store.close([closed])
    expect(store.tabs).toHaveLength(2)
    expect(store.closed[0]).toMatchObject({ id: closed, position: 1, path: '/entries/1/edit' })
    expect(store.pageKey('/entries/1/edit')).toBe(page)
    store.visit('/entries/1/edit/cast', '编辑条目')
    expect(store.closed).toHaveLength(0)
    expect(store.tabs[1]).toMatchObject({ id: closed, path: '/entries/1/edit/cast', kind: 'GAME' })
    expect(store.pageKey('/entries/1/edit')).not.toBe(page)
  })

  it('keeps pinned tabs in front', () => {
    const store = useCreatorTabsStore()
    store.visit('/create/wiki', '维基工作台')
    store.visit('/entries/1/edit', '编辑条目')
    const last = store.tabs[1]!.id
    store.pin(last, true)
    expect(store.tabs[0]!.id).toBe(last)
  })
})
