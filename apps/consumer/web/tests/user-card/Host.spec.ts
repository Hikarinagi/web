import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import UserCardHost from '../../app/components/user-card/Host.vue'
import HoverCardHost from '../../app/components/hover-card/Host.vue'
import {
  useUserCard,
  type UserCardData,
} from '../../app/components/user-card/composables/useUserCard'

function user(id: number): UserCardData {
  return {
    id,
    name: `user_${id}`,
    avatar: null,
  } as unknown as UserCardData
}

const UserCardStub = defineComponent({
  name: 'UserCard',
  props: ['user', 'loading'],
  setup(props) {
    return () =>
      h('div', {
        'data-stub-user-card': '',
        'data-user-id': props.user?.id ?? '',
        'data-loading': String(props.loading),
      })
  },
})

async function flushUserCard() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

function mountHost() {
  return mount(UserCardHost, {
    attachTo: document.body,
    global: {
      components: { HoverCardHost },
      stubs: { UserCard: UserCardStub },
    },
  })
}

const renderedCard = () => document.body.querySelector('[data-stub-user-card]')

function anchor() {
  const el = document.createElement('span')
  document.body.append(el)
  return el
}

describe('user-card/Host.vue', () => {
  beforeEach(() => {
    const card = useUserCard()
    card.hideNow()
    card.invalidate(1)
    card.invalidate(2)
    vi.stubGlobal('useRoute', () => ({ fullPath: '/editor' }))
    vi.stubGlobal(
      'hikariRequest',
      vi.fn((_: string, options: { path: { id: number } }) =>
        Promise.resolve(user(options.path.id)),
      ),
    )
  })

  afterEach(() => {
    useUserCard().hideNow()
    vi.unstubAllGlobals()
  })

  it('切换到另一个用户时卡片跟着换人，不会留着上一位的资料', async () => {
    mountHost()
    const card = useUserCard()

    card.showNow(1, anchor())
    await flushUserCard()
    expect(renderedCard()?.getAttribute('data-user-id')).toBe('1')

    card.showNow(2, anchor())
    await flushUserCard()
    expect(renderedCard()?.getAttribute('data-user-id')).toBe('2')
  })

  it('换人期间不把上一位的资料当成已加载好的内容显示', async () => {
    mountHost()
    const card = useUserCard()

    card.showNow(1, anchor())
    await flushUserCard()

    card.showNow(2, anchor())
    await nextTick()
    const during = renderedCard()
    expect(during).not.toBeNull()
    expect(during?.getAttribute('data-user-id')).not.toBe('1')
    expect(during?.getAttribute('data-loading')).toBe('true')
  })
})
