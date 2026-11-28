import { mount } from '@vue/test-utils'
import { createTextVNode, h, type VNode } from 'vue'
import { describe, expect, it } from 'vitest'
import Message from '../../app/components/locale/Message.vue'
import { i18n } from '../stubs/i18n'

const render = (node: () => VNode) =>
  mount({ render: () => h('p', [node()]) }, { global: { plugins: [i18n] } })

describe('LocaleMessage', () => {
  it('renders the slot where its placeholder sits in the message', () => {
    const wrapper = render(() =>
      h(Message, { keypath: 'lottery.result.claimBy' }, { time: () => h('time', '12 月 1 日') }),
    )
    expect(wrapper.text()).toBe('请在 12 月 1 日 前领取，逾期视为放弃。')
    expect(wrapper.html()).toBe('<p>请在 <time>12 月 1 日</time> 前领取，逾期视为放弃。</p>')
  })

  it('fills plain params and slots in the same message', () => {
    const wrapper = render(() =>
      h(
        Message,
        { keypath: 'lottery.phase.open', params: { count: 12 } },
        { time: () => h('time', '明天') },
      ),
    )
    expect(wrapper.html()).toBe('<p><time>明天</time>开奖，已有 12 人参与</p>')
  })

  it('keeps the spacing a caller puts inside a slot', () => {
    const wrapper = render(() =>
      h(
        Message,
        { keypath: 'lottery.phase.open', params: { count: 3 } },
        { time: () => [h('time', '11 月 30 日 20:00'), createTextVNode(' ')] },
      ),
    )
    expect(wrapper.text()).toBe('11 月 30 日 20:00 开奖，已有 3 人参与')
  })

  it('prints params verbatim even when they look like message syntax', () => {
    const wrapper = render(() =>
      h(Message, {
        keypath: 'lottery.result.won',
        params: { tier: '@:lottery.name | {name}', name: 'a@b|c {x}' },
      }),
    )
    expect(wrapper.text()).toBe('你中了@:lottery.name | {name}：a@b|c {x}')
  })

  it('renders a message without slots as text', () => {
    const wrapper = render(() => h(Message, { keypath: 'lottery.phase.announced' }))
    expect(wrapper.html()).toBe('<p>结果已公布</p>')
  })
})
