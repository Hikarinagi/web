import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Center from '../../app/components/me/download/Center.vue'

const engine = vi.hoisted(() => ({
  runs: new Map(),
  interrupted: new Set(),
  resume: vi.fn(),
  pause: vi.fn(),
  cancel: vi.fn(),
}))
const toastFailure = vi.hoisted(() => vi.fn())
vi.mock('~/features/download/useDownloadEngine', () => ({
  toastFailure,
  useDownloadEngine: () => engine,
}))

const Table = defineComponent({
  name: 'MeDownloadTable',
  props: { tasks: Array, runs: Map, interrupted: Set, busy: Number },
  emits: ['resume', 'pause', 'remove'],
  setup: () => () => h('div'),
})

const task = { id: 7, title: '作品', format: 'CBZ', update_required_cards: 2 }

function render() {
  return mount(Center, {
    props: {
      data: {
        tasks: [task],
        cards: { available: 3 },
        limits: { daily_limit_bytes: 100, daily_used_bytes: 40 },
      } as never,
      refresh: vi.fn(async () => undefined),
    },
    global: { components: { MeDownloadTable: Table } },
  })
}

describe('MeDownloadCenter resume', () => {
  afterEach(() => {
    engine.resume.mockReset()
    toastFailure.mockReset()
  })

  it('hands a failed resume to toastFailure and frees the row again', async () => {
    const error = new DOMException('The request is not allowed.', 'NotAllowedError')
    engine.resume.mockRejectedValue(error)
    const wrapper = render()
    wrapper.getComponent(Table).vm.$emit('resume', task)
    await flushPromises()
    expect(engine.resume).toHaveBeenCalledWith(task, 2)
    expect(toastFailure).toHaveBeenCalledWith(error)
    expect(wrapper.getComponent(Table).props('busy')).toBeNull()
    wrapper.unmount()
  })

  it('shows nothing when the resume succeeds', async () => {
    engine.resume.mockResolvedValue(null)
    const wrapper = render()
    wrapper.getComponent(Table).vm.$emit('resume', task)
    await flushPromises()
    expect(toastFailure).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
