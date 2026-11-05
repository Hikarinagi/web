import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { resourceKey, tabPath } from '~/features/creator/tabs'
import { useCreatorTabsStore } from '~/stores/creator-tabs'

describe('tabPath', () => {
  it('drops the dialogs a tab had open and keeps where it was', () => {
    expect(tabPath('/entries/1/edit/cast?side=hints&save=1&focus=4')).toBe(
      '/entries/1/edit/cast?side=hints',
    )
    expect(tabPath('/entries/1/edit?panel=undo&edit=4&discard=1&hint=2')).toBe('/entries/1/edit')
    expect(tabPath('/create/wiki/rules/A.7.1#A.7.1')).toBe('/create/wiki/rules/A.7.1#A.7.1')
  })
})

describe('resourceKey', () => {
  it('puts the parts of one editor, history or list under one key', () => {
    expect(resourceKey('/entries/25271/edit/releases/61022?focus=41')).toBe('edit:25271')
    expect(resourceKey('/entries/25271/history/12')).toBe('history:25271')
    expect(resourceKey('/create/wiki/changes/801?panel=undo')).toBe('changes')
    expect(resourceKey('/create/wiki/new?type=GAME')).toBe('/create/wiki/new')
  })
})

describe('creator tabs store', () => {
  const current = shallowRef({ fullPath: '/' })
  let last = ''
  vi.stubGlobal('useRouter', () => ({ currentRoute: current }))

  const go = (store: ReturnType<typeof useCreatorTabsStore>, path: string, title: string) => {
    const from = last
    current.value = { fullPath: path }
    store.visit(path, title, from)
    last = path
  }

  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    current.value = { fullPath: '/' }
    last = ''
  })

  it('follows the address, keeping one tab for each content and where it was left', () => {
    const store = useCreatorTabsStore()
    go(store, '/create/wiki/changes', '全部修改')
    const changes = store.activeId
    go(store, '/create/wiki/changes/5?save=1', '修改详情')
    expect(store.tabs).toHaveLength(1)
    expect(store.tabs[0]!.path).toBe('/create/wiki/changes/5')
    go(store, '/entries/1/edit', '编辑条目')
    go(store, '/entries/1/edit/cast?panel=protect', '编辑条目')
    expect(store.tabs.map(tab => tab.path)).toEqual([
      '/create/wiki/changes/5',
      '/entries/1/edit/cast',
    ])
    go(store, '/create/wiki/changes/5', '修改详情')
    expect(store.activeId).toBe(changes)
    expect(store.tabs).toHaveLength(2)
  })

  it('reads the active tab from the address alone', () => {
    const store = useCreatorTabsStore()
    go(store, '/create/wiki', '维基工作台')
    go(store, '/entries/1/edit', '编辑条目')
    current.value = { fullPath: '/create/wiki?x=1' }
    expect(store.active?.path).toBe('/create/wiki')
    current.value = { fullPath: '/create/manga' }
    expect(store.active).toBeUndefined()
  })

  it('opens a tab beside the one it came from and does not open the same content twice', () => {
    const store = useCreatorTabsStore()
    go(store, '/create/wiki', '维基工作台')
    go(store, '/create/wiki/rules', '编辑规范')
    go(store, '/create/wiki', '维基工作台')
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

  it('puts the new tab page last instead of where it was closed', () => {
    const store = useCreatorTabsStore()
    go(store, '/create/wiki', '维基工作台')
    go(store, '/entries/1/edit', '编辑条目')
    go(store, '/entries/2/edit', '编辑条目')
    store.close([store.tabs[0]!.id])
    store.expect('/create/wiki', 'end')
    go(store, '/create/wiki', '维基工作台')
    expect(store.tabs.map(tab => tab.path)).toEqual([
      '/entries/1/edit',
      '/entries/2/edit',
      '/create/wiki',
    ])
    expect(store.closed).toHaveLength(0)
  })

  it('keeps the title a page gave its tab until the tab turns to other content', () => {
    const store = useCreatorTabsStore()
    go(store, '/entries/1/edit', '编辑条目')
    store.rename('/entries/1/edit', '見上げてごらん、夜空の星を', 'GAME')
    go(store, '/entries/1/edit/cast?saved=9', '编辑条目')
    expect(store.active).toMatchObject({ title: '見上げてごらん、夜空の星を', kind: 'GAME' })
  })

  it('lets a page name its tab while in the background, only while the tab shows that page', () => {
    const store = useCreatorTabsStore()
    go(store, '/entries/1/history', '修改记录')
    go(store, '/entries/1/history/3', '单个版本')
    go(store, '/create/wiki', '维基工作台')
    store.rename('/entries/1/history', '見上げてごらん、夜空の星を的修改记录')
    expect(store.tabs[0]!.title).toBe('修改记录')
    store.rename('/entries/1/history/3', '見上げてごらん、夜空の星を：第 3 版')
    expect(store.tabs[0]!.title).toBe('見上げてごらん、夜空の星を：第 3 版')
    expect(store.active?.title).toBe('维基工作台')
  })

  it('hands over to the tab seen last when the current one closes', () => {
    const store = useCreatorTabsStore()
    go(store, '/create/wiki', '维基工作台')
    go(store, '/create/wiki/rules', '编辑规范')
    go(store, '/entries/1/edit', '编辑条目')
    const rules = store.tabs[1]!.id
    go(store, '/create/wiki/rules', '编辑规范')
    go(store, '/entries/1/edit', '编辑条目')
    expect(store.successor([store.activeId])?.id).toBe(rules)
  })

  it('brings a closed tab back where it was only when it is reopened', () => {
    const store = useCreatorTabsStore()
    go(store, '/create/wiki', '维基工作台')
    go(store, '/entries/1/edit', '编辑条目')
    store.rename('/entries/1/edit', '見上げてごらん、夜空の星を', 'GAME')
    go(store, '/create/wiki/changes', '全部修改')
    const page = store.pageKey('/entries/1/edit')
    const closed = store.tabs[1]!.id
    store.close([closed])
    expect(store.tabs).toHaveLength(2)
    expect(store.closed[0]).toMatchObject({ id: closed, position: 1, path: '/entries/1/edit' })
    expect(store.pageKey('/entries/1/edit')).toBe(page)
    store.expect('/entries/1/edit/cast', 'restore')
    go(store, '/entries/1/edit/cast', '编辑条目')
    expect(store.closed).toHaveLength(0)
    expect(store.tabs[1]).toMatchObject({ id: closed, path: '/entries/1/edit/cast', kind: 'GAME' })
    expect(store.pageKey('/entries/1/edit')).not.toBe(page)
  })

  it('opens a closed content as a new tab beside the current one when it is not reopened', () => {
    const store = useCreatorTabsStore()
    go(store, '/create/wiki', '维基工作台')
    go(store, '/entries/1/edit', '编辑条目')
    go(store, '/create/wiki/changes', '全部修改')
    const closed = store.tabs[1]!.id
    store.close([closed])
    go(store, '/entries/1/edit', '编辑条目')
    expect(store.tabs.map(tab => tab.path)).toEqual([
      '/create/wiki',
      '/create/wiki/changes',
      '/entries/1/edit',
    ])
    expect(store.tabs[2]!.id).not.toBe(closed)
    expect(store.closed).toHaveLength(0)
  })

  it('points a finished tab at its result, or closes it when the result already has one', () => {
    const store = useCreatorTabsStore()
    go(store, '/create/wiki', '维基工作台')
    go(store, '/create/wiki/new', '新建条目')
    go(store, '/entries/2/edit', '编辑条目')
    const created = store.tabs[1]!.id
    store.retarget(created, '/entries/1/edit?saved=3', '编辑条目')
    expect(store.tabs[1]).toMatchObject({ id: created, path: '/entries/1/edit' })
    go(store, '/entries/1/merge/2', '合并条目')
    const merge = store.activeId
    store.retarget(merge, '/entries/1/edit', '编辑条目')
    expect(store.tabs.find(tab => tab.id === merge)).toBeUndefined()
  })

  it('keeps pinned tabs in front', () => {
    const store = useCreatorTabsStore()
    go(store, '/create/wiki', '维基工作台')
    go(store, '/entries/1/edit', '编辑条目')
    const pinned = store.tabs[1]!.id
    store.pin(pinned, true)
    expect(store.tabs[0]!.id).toBe(pinned)
  })
})
