import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Body from '../../app/components/notifications/detail/Body.vue'
import type {
  SystemMessageDetail,
  SystemMessageItem,
} from '../../app/features/notifications/notifications'

const paragraph = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] })

function detail(content: unknown[] | undefined, extra: Partial<SystemMessageDetail> = {}) {
  return {
    id: 1,
    type: 'NOTIFICATION',
    render_mode: 'TEMPLATE',
    template_key: 'telegram.code',
    title: 'Telegram 绑定验证码',
    actor: null,
    actors: [],
    target: null,
    is_read: false,
    sent_at: '2026-11-25T00:00:00.000Z',
    change_request_id: null,
    content_json: content === undefined ? { type: 'doc' } : { type: 'doc', content },
    content_meta: null,
    entity_summaries: {},
    emoji_sets: [],
    editor_schema_version: 1,
    ...extra,
  } as unknown as SystemMessageDetail
}

const stubs = {
  HikariContent: {
    props: ['doc'],
    template: '<div data-test="content">{{ JSON.stringify(doc) }}</div>',
  },
}

function mountBody(value: SystemMessageDetail | null, loading = false) {
  return mount(Body, {
    props: { item: value as unknown as SystemMessageItem, detail: value, loading },
    global: { stubs },
  })
}

describe('NotificationsDetailBody', () => {
  it('renders the whole body, fixed sentences included, from the one document the backend sends', () => {
    const wrapper = mountBody(
      detail([
        paragraph('验证码：482913，10 分钟内有效。'),
        paragraph('回到 Telegram 把它发给机器人即可完成绑定。'),
      ]),
    )
    const content = wrapper.findAll('[data-test="content"]')
    expect(content).toHaveLength(1)
    expect(content[0]!.text()).toContain('验证码：482913，10 分钟内有效。')
    expect(content[0]!.text()).toContain('回到 Telegram 把它发给机器人即可完成绑定。')
  })

  it('draws no body for an empty document', () => {
    expect(mountBody(detail(undefined)).find('[data-test="content"]').exists()).toBe(false)
    expect(mountBody(detail([])).find('[data-test="content"]').exists()).toBe(false)
  })

  it('reads nothing but the document, so a detail without the retired lines field still renders', () => {
    const value = detail([paragraph('说明：有错字。')])
    expect('lines' in value).toBe(false)
    expect(mountBody(value).find('[data-test="content"]').text()).toContain('说明：有错字。')
  })
})
