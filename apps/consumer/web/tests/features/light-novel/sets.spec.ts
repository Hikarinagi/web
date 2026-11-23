import { shelfGroups, type LightNovelVolumeSet } from '~/features/light-novel/sets'

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
    edition: null,
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
  set(61, { name: '角川文庫', edition: 'REVISED' }, [
    volume(11, readable),
    volume(12, false),
    volume(13, false),
  ])

describe('shelfGroups', () => {
  const shelf = (sets: LightNovelVolumeSet[]) =>
    shelfGroups({
      volumes: sets.find(item => item.original)?.volumes ?? [volume(99, false)],
      sets,
    }).map(group => [group.key, group.name, group.original, group.items.map(item => item.id)])

  it('lists every set that has a volume to read, the original first', () => {
    expect(shelf([original(true), reissue(true)])).toEqual([
      [60, '電撃文庫', true, [1, 2]],
      [61, '新装版', false, [11, 12, 13]],
    ])
  })

  it('lists the only set with volumes to read even when it is not the original', () => {
    expect(shelf([original(false), reissue(true)])).toEqual([[61, '新装版', false, [11, 12, 13]]])
    expect(shelf([original(true), reissue(false)])).toEqual([[60, '電撃文庫', true, [1, 2]]])
  })

  it('falls back on the volumes of the work when no set has anything to read', () => {
    expect(shelf([original(false), reissue(false)])).toEqual([[0, '', true, [1, 2]]])
    expect(shelf([])).toEqual([[0, '', true, [99]]])
  })
})
