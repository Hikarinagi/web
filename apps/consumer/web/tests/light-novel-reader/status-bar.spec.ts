import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import StatusBar from '~/components/light-novel-reader/desktop/StatusBar.vue'
import TocPanel from '~/components/light-novel-reader/toc/Panel.vue'
import { provideReader, type ReaderContext } from '~/features/light-novel-reader/context'

const mounted: VueWrapper[] = []

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

const row = (label: string) => ({ key: label, label, depth: 0, pages: 12 })

function contextOf(options: { title?: string; phase?: string; label?: string }) {
  const rows = [row('第一章'), row('第二章')]
  const shell = { quickToc: ref(false) }
  const goTo = vi.fn()
  const context = {
    location: {
      title: ref(options.title ?? ''),
      current: ref(options.label ? rows[1] : undefined),
      rows: ref(rows),
      chapter: ref(null),
      book: ref(null),
      laid: ref(false),
      position: ref(null),
      minutesLeft: ref(null),
    },
    settings: { device: ref({ showTime: false }) },
    engine: { phase: ref(options.phase ?? 'ready') },
    shell,
    goTo,
  } as unknown as ReaderContext
  return { context, shell, goTo, rows }
}

function mountIn(context: ReaderContext, child: () => unknown) {
  const wrapper = mount(
    defineComponent({
      setup() {
        provideReader(context)
        return child as () => never
      },
    }),
    {
      attachTo: document.body,
      global: {
        components: {
          LightNovelReaderTocPanel: defineComponent({
            props: { block: { type: String, default: undefined } },
            setup: props => () => h('div', { 'data-toc': props.block }),
          }),
        },
      },
    },
  )
  mounted.push(wrapper)
  return wrapper
}

const trigger = (wrapper: VueWrapper) => wrapper.get('footer button')

describe('状态栏的章节名', () => {
  it('点击后就地弹出目录，打开时当前章节居中', async () => {
    const { context, shell } = contextOf({ title: '大一 12月 浅村悠太' })
    const wrapper = mountIn(context, () => h(StatusBar))
    expect(trigger(wrapper).text()).toContain('大一 12月 浅村悠太')

    await trigger(wrapper).trigger('click')
    await flushPromises()

    expect(shell.quickToc.value).toBe(true)
    expect(document.body.querySelector('[data-toc="center"]')).not.toBeNull()
  })

  it('跳转后状态关闭时，浮层一起消失', async () => {
    const { context, shell } = contextOf({ title: '第一章' })
    const wrapper = mountIn(context, () => h(StatusBar))
    await trigger(wrapper).trigger('click')
    await flushPromises()

    shell.quickToc.value = false
    await flushPromises()

    expect(document.body.querySelector('[data-toc]')).toBeNull()
  })

  it('没有章节名时显示「目录」，仍然可以打开', () => {
    const { context } = contextOf({})
    const wrapper = mountIn(context, () => h(StatusBar))

    expect(trigger(wrapper).text()).toContain('目录')
    expect(trigger(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('书还没打开时不能点', () => {
    const { context } = contextOf({ title: '第一章', phase: 'layout' })
    const wrapper = mountIn(context, () => h(StatusBar))

    expect(trigger(wrapper).attributes('disabled')).toBeDefined()
  })
})

describe('目录面板', () => {
  function spyScroll() {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    return scroll
  }

  it('默认只把当前章节滚进视野', async () => {
    const scroll = spyScroll()
    const { context } = contextOf({ label: '第二章' })
    mountIn(context, () => h(TocPanel))
    await nextTick()
    await flushPromises()

    expect(scroll).toHaveBeenCalledWith({ block: 'nearest' })
  })

  it('可以指定把当前章节滚到中间', async () => {
    const scroll = spyScroll()
    const { context } = contextOf({ label: '第二章' })
    mountIn(context, () => h(TocPanel, { block: 'center' }))
    await nextTick()
    await flushPromises()

    expect(scroll).toHaveBeenCalledWith({ block: 'center' })
  })

  it('点选章节时跳转', async () => {
    spyScroll()
    const { context, goTo, rows } = contextOf({ label: '第二章' })
    const wrapper = mountIn(context, () => h(TocPanel))

    await wrapper.findAll('button')[0]!.trigger('click')

    expect(goTo).toHaveBeenCalledWith(rows[0])
  })
})
