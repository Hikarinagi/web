import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { useVolumeOptions } from '~/features/manga/composables/useVolumeOptions'

const request = vi.fn()
let scope: EffectScope

const volume = (id: number, volume_number: number | null, name: string | null = null) => ({
  id,
  volume_number,
  name,
  name_cn: null,
})

const set = (id: number, over: Record<string, unknown>, volumes: ReturnType<typeof volume>[]) => ({
  id,
  name: null,
  original: false,
  volume_count: volumes.length,
  publication_date: null,
  publication_date_precision: null,
  publication_status: null,
  publishers: [],
  labels: [],
  volumes,
  ...over,
})

const settle = async () => {
  for (let i = 0; i < 5; i++) await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
}

function setup(series = ref<number | null>(7)) {
  scope = effectScope()
  return scope.run(() => useVolumeOptions(() => series.value))!
}

afterEach(() => {
  scope.stop()
  vi.unstubAllGlobals()
  request.mockReset()
})

describe('useVolumeOptions', () => {
  it('groups the volumes of a work with several sets under the name of each set', async () => {
    request.mockImplementation(async (url: string) =>
      url.endsWith('/sets')
        ? [
            set(70, { original: true, labels: [{ id: 1, name: 'ジャンプ・コミックス' }] }, [
              volume(1, 1),
              volume(2, 2),
            ]),
            set(80, { name: '完全版' }, [volume(3, 1), volume(4, null, '総集編')]),
          ]
        : [],
    )
    vi.stubGlobal('hikariRequest', request)
    const { options, loading } = setup()
    await settle()

    expect(options.value).toEqual([
      {
        label: 'ジャンプ・コミックス',
        options: [
          { value: 1, label: '第 1 卷' },
          { value: 2, label: '第 2 卷' },
        ],
      },
      {
        label: '完全版',
        options: [
          { value: 3, label: '第 1 卷' },
          { value: 4, label: '総集編' },
        ],
      },
    ])
    expect(loading.value).toBe(false)
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('lists the volumes of the only set, or of the work when it has no set, without groups', async () => {
    request.mockImplementation(async (url: string) =>
      url.endsWith('/sets') ? [set(70, { original: true }, [volume(1, 1)])] : [],
    )
    vi.stubGlobal('hikariRequest', request)
    const single = setup()
    await settle()
    expect(single.options.value).toEqual([{ value: 1, label: '第 1 卷' }])
    scope.stop()

    request.mockReset()
    request.mockImplementation(async (url: string) =>
      url.endsWith('/sets') ? [] : [volume(5, 1), volume(6, 2)],
    )
    const none = setup()
    await settle()
    expect(none.options.value).toEqual([
      { value: 5, label: '第 1 卷' },
      { value: 6, label: '第 2 卷' },
    ])
    expect(request).toHaveBeenCalledWith('/api/v3/mangas/{id}/volumes', {
      path: { id: 7 },
      toast: false,
    })
  })
})
