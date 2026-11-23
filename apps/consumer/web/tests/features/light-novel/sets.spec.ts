import { effectScope, ref } from 'vue'
import { shelfSets, type LightNovelVolumeSet } from '~/features/light-novel/sets'
import { useShelfSet } from '~/features/light-novel/useShelfSet'

type Volume = LightNovelVolumeSet['volumes'][number]

const volume = (id: number, readable: boolean) =>
  ({ id, online_reading_available: readable }) as Volume

function set(
  id: number,
  over: Partial<LightNovelVolumeSet>,
  volumes: Volume[],
): LightNovelVolumeSet {
  return {
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
  }
}

const original = (readable: boolean) =>
  set(60, { original: true, labels: [{ id: 3, name: '電撃文庫' }] }, [
    volume(1, readable),
    volume(2, false),
  ])
const reissue = (readable: boolean) =>
  set(61, { name: '新装版' }, [volume(11, readable), volume(12, false), volume(13, false)])

describe('shelfSets', () => {
  it('offers only the sets that have a volume to read, named with their volume count', () => {
    expect(shelfSets([original(true), reissue(true)])).toEqual([
      { value: 60, label: '電撃文庫 2 卷', key: 0, original: true },
      { value: 61, label: '新装版 3 卷', key: 61, original: false },
    ])
    expect(shelfSets([original(false), reissue(true)]).map(option => option.value)).toEqual([61])
    expect(shelfSets([original(false), reissue(false)])).toEqual([])
  })
})

describe('useShelfSet', () => {
  function setup(sets: LightNovelVolumeSet[], chosen: number | null = null) {
    const volumes = sets.find(item => item.original)?.volumes ?? [volume(99, false)]
    const choice = ref<number | null>(chosen)
    const scope = effectScope()
    const shelf = scope.run(() => useShelfSet(() => ({ volumes, sets }), choice))!
    return { shelf, choice, scope }
  }

  it('shows the original set when both sets have volumes to read, and the chosen one after a switch', () => {
    const { shelf, choice } = setup([original(true), reissue(true)])
    expect(shelf.model.value).toBe(60)
    expect(shelf.volumes.value.map(item => item.id)).toEqual([1, 2])
    shelf.model.value = 61
    expect(choice.value).toBe(61)
    expect(shelf.volumes.value.map(item => item.id)).toEqual([11, 12, 13])
  })

  it('shows the only set with volumes to read even when it is not the original', () => {
    const { shelf } = setup([original(false), reissue(true)])
    expect(shelf.options.value).toHaveLength(1)
    expect(shelf.model.value).toBe(61)
    expect(shelf.volumes.value.map(item => item.id)).toEqual([11, 12, 13])
  })

  it('ignores a chosen set that has nothing to read', () => {
    const { shelf } = setup([original(true), reissue(false)], 61)
    expect(shelf.model.value).toBe(60)
    expect(shelf.volumes.value.map(item => item.id)).toEqual([1, 2])
  })

  it('falls back on the volumes of the original set when no set has anything to read', () => {
    expect(
      setup([original(false), reissue(false)]).shelf.volumes.value.map(item => item.id),
    ).toEqual([1, 2])
    expect(setup([]).shelf.volumes.value.map(item => item.id)).toEqual([99])
  })
})
