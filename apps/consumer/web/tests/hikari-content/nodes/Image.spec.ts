import type { EditorDocument } from '@hikarinagi/editor-schema'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import Image from '../../../app/components/hikari-content/nodes/Image.vue'

const HikariImageStub = defineComponent({
  name: 'HikariImage',
  props: ['src', 'alt', 'preset', 'lazy', 'preload', 'skeleton', 'imageClass'],
  setup(props) {
    return () => h('img', { src: props.src, alt: props.alt, 'data-preset': props.preset })
  },
})

function makeNode(
  attrs: Record<string, unknown>,
): EditorDocument['content'] extends infer T ? T : never {
  return { type: 'image_block', attrs } as never
}

function render(attrs: Record<string, unknown>) {
  return mount(Image, {
    props: { node: makeNode(attrs) },
    global: { stubs: { HikariImage: HikariImageStub } },
  }).html()
}

describe('hikari-content/nodes/Image.vue', () => {
  it('renders figure with width/height aspect-ratio + width_percent + media-asset-id', () => {
    const html = render({
      media_asset_id: 42,
      src: 'media/a.webp',
      alt: '示例',
      caption: null,
      width: 1280,
      height: 720,
      width_percent: 75,
    })
    expect(html).toMatchSnapshot()
  })

  it('renders figcaption sibling when caption is non-empty', () => {
    const html = render({
      media_asset_id: 1,
      src: 'media/b.webp',
      alt: '',
      caption: '图注内容',
      width: 800,
      height: 600,
      width_percent: 100,
    })
    expect(html).toMatchSnapshot()
  })

  it('renders selected ring via box-shadow inline style when selected=true', () => {
    const wrapper = mount(Image, {
      props: { node: makeNode({ src: 'media/c.webp', width: 100, height: 100 }), selected: true },
      global: { stubs: { HikariImage: HikariImageStub } },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
