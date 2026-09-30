import { effectScope, nextTick, type EffectScope } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTranslationEditor } from '~/features/workbench/composables/useTranslationEditor'

const request = vi.fn()
vi.stubGlobal('useAuthStore', () => ({ user: { id: 1 } }))
vi.stubGlobal('hikariRequest', request)

const segment = (id: string, state: number, machine = false) =>
  ({
    id,
    kind: 'TEXT',
    text: id,
    state,
    translations: machine
      ? [{ id: `${id}-t`, text: 'AI', selected: true, machine: true, user: { id: 2 } }]
      : [],
  }) as never

describe('useTranslationEditor 段落筛选', () => {
  let scope: EffectScope

  beforeEach(() => {
    scope = effectScope()
  })

  afterEach(() => scope.stop())

  it('当前选中的段落不会出现在不符合条件的筛选里', async () => {
    const editor = scope.run(() =>
      useTranslationEditor(1, [segment('a', 0), segment('b', 0), segment('c', 30, true)]),
    )!
    editor.activeId.value = 'a'
    await nextTick()
    editor.filter.value = 'machine'
    await nextTick()
    expect(editor.visible.value.map(item => item.id)).toEqual(['c'])
  })

  it('在筛选里选中后开始编辑，这一段不会从列表里消失', async () => {
    const editor = scope.run(() => useTranslationEditor(1, [segment('a', 0), segment('b', 0)]))!
    editor.filter.value = 'empty'
    await nextTick()
    editor.activeId.value = 'b'
    await nextTick()
    editor.edit('b', '译文')
    expect(editor.visible.value.map(item => item.id)).toEqual(['a', 'b'])
  })
})

describe('useTranslationEditor 清空译文', () => {
  let scope: EffectScope

  beforeEach(() => {
    scope = effectScope()
    request.mockReset()
  })

  afterEach(() => scope.stop())

  const translated = (userId: number) =>
    ({
      id: 'a',
      kind: 'TEXT',
      text: '原文',
      state: 20,
      translations: [{ id: 7, text: '译文', selected: true, machine: false, user: { id: userId } }],
    }) as never

  it('清空自己的译文后删除它，段落回到未翻译', async () => {
    request.mockResolvedValue({ id: 'a', state: 0 })
    const editor = scope.run(() => useTranslationEditor(1, [translated(1)]))!
    editor.edit('a', '  ')
    await editor.save('a')
    expect(request).toHaveBeenCalledWith('/api/v3/novel-segments/{segment_id}/translations/me', {
      method: 'delete',
      path: { segment_id: 'a' },
      toast: false,
    })
    const [segment] = editor.segments.value
    expect(segment).toMatchObject({ state: 0, translations: [] })
    expect(editor.textOf(segment!)).toBe('')
  })

  it('显示的是别人的译文时，清空不发请求，仍显示原来的译文', async () => {
    const editor = scope.run(() => useTranslationEditor(1, [translated(2)]))!
    editor.edit('a', '')
    await editor.save('a')
    expect(request).not.toHaveBeenCalled()
    expect(editor.textOf(editor.segments.value[0]!)).toBe('译文')
  })
})
