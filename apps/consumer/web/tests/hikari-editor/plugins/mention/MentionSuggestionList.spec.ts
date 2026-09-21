import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { Skeleton } from '@hina-ui/vue'
import MentionSuggestionList from '../../../../app/components/hikari-editor/plugins/mention/MentionSuggestionList.vue'

function mountList(props: { query?: string; loading?: boolean; resolved?: boolean } = {}) {
  return mount(MentionSuggestionList, {
    props: {
      items: [],
      loading: false,
      resolved: false,
      query: '',
      highlighted: 0,
      command: vi.fn(),
      ...props,
    },
  })
}

describe('hikari-editor/plugins/mention/MentionSuggestionList.vue', () => {
  it('keeps the skeleton while a non-empty query has not resolved yet', () => {
    const wrapper = mountList({ query: 'ring' })

    expect(wrapper.findAllComponents(Skeleton).length).toBeGreaterThan(0)
    expect(wrapper.text()).not.toContain('未找到匹配用户')
  })

  it('shows no-result copy only after an explicit empty result resolves', () => {
    const wrapper = mountList({ query: 'ring', resolved: true })

    expect(wrapper.findAllComponents(Skeleton)).toHaveLength(0)
    expect(wrapper.text()).toContain('未找到匹配用户')
  })

  it('keeps the initial prompt for an empty query', () => {
    const wrapper = mountList()

    expect(wrapper.findAllComponents(Skeleton)).toHaveLength(0)
    expect(wrapper.text()).toContain('输入用户名搜索')
  })
})
