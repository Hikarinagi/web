import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import MentionSuggestionList from '../../../../app/components/hikari-editor/plugins/mention/MentionSuggestionList.vue'

const SkeletonStub = defineComponent({
  name: 'Skeleton',
  setup() {
    return () => h('div', { 'data-stub-skeleton': '' })
  },
})

const ButtonStub = defineComponent({
  name: 'Button',
  setup(_, { slots }) {
    return () => h('button', slots.default?.())
  },
})

const AvatarStub = defineComponent({
  name: 'Avatar',
  setup() {
    return () => h('span', { 'data-stub-avatar': '' })
  },
})

function mountList(props: { query?: string; loading?: boolean; resolved?: boolean } = {}) {
  return mount(MentionSuggestionList, {
    props: {
      items: [],
      loading: false,
      resolved: false,
      query: '',
      command: vi.fn(),
      ...props,
    },
    global: {
      stubs: {
        Avatar: AvatarStub,
        Button: ButtonStub,
        Skeleton: SkeletonStub,
      },
    },
  })
}

describe('hikari-editor/plugins/mention/MentionSuggestionList.vue', () => {
  it('keeps the skeleton while a non-empty query has not resolved yet', () => {
    const wrapper = mountList({ query: 'ring' })

    expect(wrapper.findAll('[data-stub-skeleton]').length).toBeGreaterThan(0)
    expect(wrapper.text()).not.toContain('未找到匹配用户')
  })

  it('shows no-result copy only after an explicit empty result resolves', () => {
    const wrapper = mountList({ query: 'ring', resolved: true })

    expect(wrapper.findAll('[data-stub-skeleton]')).toHaveLength(0)
    expect(wrapper.text()).toContain('未找到匹配用户')
  })

  it('keeps the initial prompt for an empty query', () => {
    const wrapper = mountList()

    expect(wrapper.findAll('[data-stub-skeleton]')).toHaveLength(0)
    expect(wrapper.text()).toContain('输入用户名搜索')
  })
})
