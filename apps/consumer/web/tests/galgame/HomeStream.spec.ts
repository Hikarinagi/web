import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGalgameHomeStream } from '../../app/features/galgame/useHomeStream'

describe('Galgame home stream', () => {
  const states = new Map<string, ReturnType<typeof ref>>()
  const data = ref()
  const error = ref()
  const requestQueries: Record<string, unknown>[] = []
  let batches: unknown[]

  beforeEach(() => {
    states.clear()
    data.value = undefined
    error.value = undefined
    requestQueries.length = 0
    batches = [
      {
        modules: [rail('tag-1', ids(1, 12)), grid('grid-0', ids(13, 18))],
        next_cursor: 1,
      },
      {
        modules: [
          grid('grid-1', ids(31, 18)),
          { kind: 'feature', key: 'feature-49', item: { id: 49 }, intro: null },
        ],
        next_cursor: null,
      },
    ]

    vi.stubGlobal('useAuthStore', () => ({ user: null }))
    vi.stubGlobal('useState', (key: string, factory: () => unknown) => {
      if (!states.has(key)) states.set(key, ref(factory()))
      return states.get(key)
    })
    vi.stubGlobal(
      'useHikariApiData',
      (_path: string, options: { query: Record<string, unknown> }) => ({
        data,
        error,
        execute: async () => {
          requestQueries.push({ ...options.query })
          data.value = batches.shift()
        },
      }),
    )
  })

  it('requests by batch number and appends the final server modules', async () => {
    const stream = useGalgameHomeStream()

    await stream.loadMore()
    await stream.loadMore()

    expect(requestQueries).toEqual([{ cursor: 0 }, { cursor: 1 }])
    const displayed = stream.modules.value.flatMap(module =>
      module.kind === 'feature' ? [module.item.id] : module.items.map(item => item.id),
    )
    expect(new Set(displayed).size).toBe(displayed.length)
    expect(stream.modules.value.filter(module => module.kind === 'rail')).toHaveLength(1)
    expect(stream.modules.value[0]?.kind === 'rail' && stream.modules.value[0].items).toHaveLength(
      12,
    )
    expect(stream.done.value).toBe(true)
  })

  it('deduplicates grids globally and contextual modules within the recent window', async () => {
    batches = [
      {
        modules: [rail('rail-0', ids(1, 12)), grid('grid-0', ids(13, 18))],
        next_cursor: 1,
      },
      {
        modules: [
          { kind: 'feature', key: 'feature-1', item: { id: 1 }, intro: null },
          grid('grid-1', ids(20, 18)),
        ],
        next_cursor: null,
      },
    ]
    const stream = useGalgameHomeStream()

    await stream.loadMore()
    await stream.loadMore()

    const displayed = stream.modules.value.flatMap(module =>
      module.kind === 'feature' ? [module.item.id] : module.items.map(item => item.id),
    )
    expect(new Set(displayed).size).toBe(displayed.length)
    expect(stream.modules.value.some(module => module.kind === 'feature')).toBe(false)
    expect(stream.modules.value).toEqual([
      rail('rail-0', ids(1, 12)),
      grid('grid-0', ids(13, 18)),
      grid('grid-1', ids(31, 7)),
    ])
  })

  it('keeps contextual recommendations reusable after they leave the dedup window', async () => {
    batches = [
      {
        modules: Array.from({ length: 6 }, (_, index) =>
          grid(`grid-${index}`, [{ id: index + 1 }]),
        ),
        next_cursor: 1,
      },
      {
        modules: [
          { kind: 'feature', key: 'feature-1', item: { id: 1 }, intro: null },
          grid('grid-6', [{ id: 1 }, { id: 7 }]),
        ],
        next_cursor: null,
      },
    ]
    const stream = useGalgameHomeStream()

    await stream.loadMore()
    await stream.loadMore()

    expect(stream.modules.value.some(module => module.kind === 'feature')).toBe(true)
    expect(stream.modules.value.at(-1)).toEqual(grid('grid-6', [{ id: 7 }]))
  })

  it('drops persisted modules when the viewer changed while the page was unmounted', async () => {
    states.set('galgame:home:v3:modules', ref([grid('grid-old', ids(1, 18))]))
    states.set('galgame:home:v3:cursor', ref(8))
    states.set('galgame:home:v3:viewer', ref('42:JUST_SHOW:false'))

    const stream = useGalgameHomeStream()

    expect(stream.modules.value).toEqual([])
    await stream.loadMore()
    expect(requestQueries).toEqual([{ cursor: 0 }])
  })
})

function ids(start: number, count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: start + index }))
}

function grid(key: string, items: { id: number }[]) {
  return { kind: 'grid', key, items }
}

function rail(key: string, items: { id: number }[]) {
  return { kind: 'rail', key, title: '#测试', to: undefined, items }
}
