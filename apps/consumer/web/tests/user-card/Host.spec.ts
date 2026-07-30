import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, onUnmounted } from 'vue'
import UserCardHost from '../../app/components/user-card/Host.vue'
import HoverCardHost from '../../app/components/hover-card/Host.vue'
import {
  useUserCard,
  type UserCardData,
} from '../../app/components/user-card/composables/useUserCard'

vi.mock('motion-v', async () => {
  const { defineComponent, h } = await import('vue')

  return {
    AnimatePresence: defineComponent({
      name: 'AnimatePresence',
      props: {
        mode: String,
        onExitComplete: Function,
      },
      setup(props, { slots }) {
        return () =>
          h(
            'div',
            {
              'data-stub-animate-presence': '',
              'data-mode': props.mode,
              onClick: () => props.onExitComplete?.(),
            },
            slots.default?.(),
          )
      },
    }),
    motion: {
      div: defineComponent({
        name: 'MotionDiv',
        setup(_, { attrs, slots }) {
          return () => h('div', { ...attrs, 'data-stub-motion': '' }, slots.default?.())
        },
      }),
    },
  }
})

vi.mock('@floating-ui/vue', async () => {
  const { ref } = await import('vue')

  return {
    autoUpdate: vi.fn(),
    flip: vi.fn(() => ({})),
    offset: vi.fn(() => ({})),
    shift: vi.fn(() => ({})),
    useFloating: vi.fn(() => ({ floatingStyles: ref({}) })),
  }
})

function user(id: number): UserCardData {
  return {
    id,
    name: `user_${id}`,
    avatar: null,
  } as unknown as UserCardData
}

async function flushUserCard() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
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

  it('remounts the card when switching to a different user', async () => {
    let unmountCount = 0
    const UserCardStub = defineComponent({
      name: 'UserCard',
      props: ['user', 'loading'],
      setup(props) {
        onUnmounted(() => {
          unmountCount += 1
        })
        return () =>
          h('div', {
            'data-stub-user-card': '',
            'data-user-id': props.user?.id ?? '',
          })
      },
    })

    const wrapper = mount(UserCardHost, {
      global: {
        components: { HoverCardHost },
        stubs: {
          Teleport: true,
          UserCard: UserCardStub,
        },
      },
    })

    const card = useUserCard()
    card.showNow(1, document.createElement('span'))
    await flushUserCard()
    expect(wrapper.find('[data-stub-user-card]').attributes('data-user-id')).toBe('1')
    expect(unmountCount).toBe(0)

    card.showNow(2, document.createElement('span'))
    await flushUserCard()
    expect(unmountCount).toBeGreaterThan(0)
    expect(wrapper.find('[data-stub-user-card]').exists()).toBe(false)

    await wrapper.find('[data-stub-animate-presence]').trigger('click')
    await flushUserCard()
    expect(wrapper.find('[data-stub-user-card]').attributes('data-user-id')).toBe('2')
  })

  it('waits for exit before entering the next user card', async () => {
    const wrapper = mount(UserCardHost, {
      global: {
        components: { HoverCardHost },
        stubs: {
          Teleport: true,
          UserCard: true,
        },
      },
    })

    useUserCard().showNow(1, document.createElement('span'))
    await flushUserCard()

    expect(wrapper.find('[data-stub-animate-presence]').attributes('data-mode')).toBe('wait')
  })
})
