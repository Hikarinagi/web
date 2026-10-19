import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick, shallowRef } from 'vue'
import type { ReaderEngine } from '~/features/light-novel-reader/useReaderEngine'
import { useReaderLocation } from '~/features/light-novel-reader/useReaderLocation'

const mounted: { unmount: () => void }[] = []

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountLocation(spreads: number[][], scope = 'book') {
  const handlers = new Map<string, (event: unknown) => void>()
  const stack = shallowRef<unknown>({
    reader: {
      layoutScope: scope,
      toc: [],
      pageCount: 431,
      findPage: () => null,
      manifestHrefMap: new Map(),
    },
    controller: {
      totalSpreads: spreads.length,
      spreads: spreads.map(pageIndexes => ({ pageIndexes })),
      on(name: string, handler: (event: unknown) => void) {
        handlers.set(name, handler)
        return () => handlers.delete(name)
      },
    },
  })
  let location!: ReturnType<typeof useReaderLocation>
  const wrapper = mount(
    defineComponent({
      setup() {
        location = useReaderLocation({ stack } as unknown as ReaderEngine)
        return () => null
      },
    }),
  )
  mounted.push(wrapper)
  const turnTo = async (spreadIndex: number) => {
    handlers.get('positionChange')?.({ position: { projection: { spreadIndex } } })
    await nextTick()
  }
  return { location, turnTo }
}

describe('全书页码', () => {
  it('单页显示当前页与全书总页数，从 1 起算', async () => {
    const { location, turnTo } = mountLocation([[0], [1], [255]])
    await turnTo(2)
    expect(location.book.value).toEqual({ from: 256, to: 256, total: 431 })
  })

  it('双页时给出左右两页', async () => {
    const { location, turnTo } = mountLocation([
      [0, 1],
      [254, 255],
    ])
    await turnTo(1)
    expect(location.book.value).toEqual({ from: 255, to: 256, total: 431 })
  })

  it('全书还没排完时不给页码', async () => {
    const { location, turnTo } = mountLocation([[0]], 'chapter')
    await turnTo(0)
    expect(location.book.value).toBeNull()
  })
})
