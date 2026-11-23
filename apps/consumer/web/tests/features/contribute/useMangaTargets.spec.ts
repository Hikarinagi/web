import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { useMangaTargets } from '~/features/contribute/useMangaTargets'

type Options = { path?: { id: number }; query?: { set_entry_id?: number } }
const request = vi.fn()
let scope: EffectScope

const set = (id: number, original: boolean, volumes: number[]) => ({
  id,
  name: original ? '少年サンデーコミックス' : '新装版',
  original,
  volume_count: volumes.length,
  publication_date: null,
  publication_date_precision: null,
  publication_status: null,
  publishers: [],
  labels: [],
  volumes: volumes.map(volume => ({ id: volume })),
})

const settle = async () => {
  for (let i = 0; i < 5; i++) await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
}

function setup(series = ref<number | null>(7), volume: () => number | null = () => null) {
  scope = effectScope()
  return { series, targets: scope.run(() => useMangaTargets(() => series.value, volume))! }
}

beforeEach(() => {
  request.mockReset()
  request.mockImplementation(async (url: string, options: Options = {}) => {
    if (url.endsWith('/sets')) return [set(70, true, [1, 2]), set(80, false, [3])]
    if (url.endsWith('/volumes/contents'))
      return options.query?.set_entry_id === 80 ? [{ id: 3 }] : [{ id: 1 }, { id: 2 }]
    if (url.endsWith('/chapters')) return []
    return { items: [] }
  })
  vi.stubGlobal('hikariRequest', request)
})

afterEach(() => {
  scope.stop()
  vi.unstubAllGlobals()
})

describe('useMangaTargets', () => {
  it('starts on the original set and lists the volumes of the set chosen next', async () => {
    const { targets } = setup()
    await settle()

    expect(targets.sets.value.map(item => item.id)).toEqual([70, 80])
    expect(targets.setId.value).toBe(70)
    expect(targets.volumes.value.map(volume => volume.id)).toEqual([1, 2])
    expect(request).toHaveBeenCalledWith('/api/v3/mangas/{id}/volumes/contents', {
      path: { id: 7 },
      query: { set_entry_id: 70 },
      toast: false,
    })

    targets.setId.value = 80
    await settle()
    expect(targets.volumes.value.map(volume => volume.id)).toEqual([3])
  })

  it('starts on the set that holds a volume given in advance', async () => {
    const { targets } = setup(ref(7), () => 3)
    await settle()

    expect(targets.setId.value).toBe(80)
    expect(targets.volumes.value.map(volume => volume.id)).toEqual([3])
  })

  it('lists the volumes without naming a set when the work has none', async () => {
    request.mockImplementation(async (url: string) =>
      url.endsWith('/sets')
        ? []
        : url.endsWith('/volumes/contents')
          ? [{ id: 1 }]
          : url.endsWith('/chapters')
            ? []
            : { items: [] },
    )
    const { targets } = setup()
    await settle()

    expect(targets.setId.value).toBeNull()
    expect(targets.volumes.value.map(volume => volume.id)).toEqual([1])
    expect(request).toHaveBeenCalledWith('/api/v3/mangas/{id}/volumes/contents', {
      path: { id: 7 },
      query: {},
      toast: false,
    })
  })
})
