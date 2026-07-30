import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UserCardTrigger from '../../app/components/user-card/Trigger.vue'
import { useUserCard } from '../../app/components/user-card/composables/useUserCard'

describe('user-card/Trigger.vue', () => {
  afterEach(() => {
    useUserCard().hideNow()
    vi.useRealTimers()
  })

  it('hides an open card when its trigger unmounts', async () => {
    const card = useUserCard()
    const wrapper = mount(UserCardTrigger, {
      props: { userId: 7, showOnClick: true },
      slots: { default: 'arisaka' },
    })

    await wrapper.trigger('click')
    expect(card.state.value?.key).toBe('7')

    wrapper.unmount()
    expect(card.state.value).toBeNull()
  })

  it('cancels a delayed show when its trigger unmounts', async () => {
    vi.useFakeTimers()
    const card = useUserCard()
    const wrapper = mount(UserCardTrigger, {
      props: { userId: 7 },
      slots: { default: 'arisaka' },
    })

    await wrapper.trigger('mouseenter')
    wrapper.unmount()
    vi.advanceTimersByTime(400)

    expect(card.state.value).toBeNull()
  })
})
