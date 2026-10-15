import { Link, Spoiler } from '@hina-ui/vue'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'
import Note from '../../app/components/galgame/downloads/game/Note.vue'
import { noteText } from '../../app/features/galgame/download'

const nodes = [
  {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'ＡＵＧＵＳＴ中文化委員會', marks: [{ type: 'bold' }] },
      { type: 'hard_break' },
      { type: 'text', text: '官方中文' },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: '发布页',
        marks: [{ type: 'link', attrs: { href: 'https://example.com/release' } }],
      },
      {
        type: 'text',
        text: '解压密码',
        marks: [{ type: 'spoiler' }, { type: 'bold' }],
      },
      {
        type: 'text',
        text: '可疑链接',
        marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
      },
    ],
  },
]

describe('Galgame 资源说明', () => {
  it('按段落和换行渲染 Shionlib 的富文本说明', () => {
    const wrapper = mount(() => h('div', h(Note, { nodes })))

    expect(wrapper.element.textContent).toBe(
      'ＡＵＧＵＳＴ中文化委員會\n官方中文\n发布页解压密码可疑链接',
    )
    expect(wrapper.find('strong').text()).toBe('ＡＵＧＵＳＴ中文化委員會')
    expect(wrapper.findAllComponents(Link).map(link => link.attributes('href'))).toEqual([
      'https://example.com/release',
    ])
    const spoiler = wrapper.findComponent(Spoiler)
    expect(spoiler.find('strong').text()).toBe('解压密码')
  })

  it('搜索用的纯文本包含说明里的全部文字', () => {
    expect(noteText(nodes)).toBe('ＡＵＧＵＳＴ中文化委員會官方中文发布页解压密码可疑链接')
  })
})
