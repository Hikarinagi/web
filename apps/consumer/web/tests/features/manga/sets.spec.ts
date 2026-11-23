import { describe, expect, it } from 'vitest'
import { contentsUnits, type ContentsItem } from '~/features/manga/contents'
import { contentsSetKey, contentsSets, type MangaVolumeSet } from '~/features/manga/sets'
import { volumeSetLabel } from '~/features/volume-set/sets'

const original = { id: 69, name: 'ジャンプコミックス', original: true }
const reissue = { id: 70, name: '完全版', original: false }

function volume(id: number, set: ContentsItem['volume_set'], over: Partial<ContentsItem> = {}) {
  return {
    id,
    chapter_type: 'VOLUME',
    chapter_number: null,
    volume_number: id,
    volume_id: id + 100,
    volume_set: set,
    title: null,
    ordinal: 1,
    page_count: 180,
    readable: true,
    ...over,
  } as ContentsItem
}

function set(id: number, over: Partial<MangaVolumeSet> = {}): MangaVolumeSet {
  return {
    id,
    name: null,
    original: false,
    volume_count: 24,
    publication_date: null,
    publication_date_precision: null,
    publication_status: null,
    publishers: [],
    labels: [],
    volumes: [],
    ...over,
  }
}

const sets = [
  set(69, { original: true, volume_count: 31, labels: [{ id: 1, name: 'ジャンプコミックス' }] }),
  set(70, { name: '完全版' }),
  set(71, { name: '新装版', volume_count: 20 }),
]

describe('volumeSetLabel', () => {
  it('names a set the way the contribution form does and counts its volumes', () => {
    expect(volumeSetLabel(sets[0]!)).toBe('ジャンプコミックス 31 卷')
    expect(volumeSetLabel(sets[1]!)).toBe('完全版 24 卷')
    expect(volumeSetLabel(set(72, { publishers: [{ id: 2, name: '集英社' }] }))).toBe(
      '集英社 24 卷',
    )
    expect(volumeSetLabel(set(73))).toBe('其他版本 24 卷')
  })
})

describe('contentsSets', () => {
  it('offers only the sets that have a readable volume, in the order of the sets', () => {
    const options = contentsSets(
      [
        volume(1, reissue),
        volume(2, original),
        volume(3, { id: 71, name: '新装版', original: false }, { readable: false }),
        { ...volume(4, null), chapter_type: 'SERIALIZATION' } as ContentsItem,
      ],
      sets,
    )
    expect(options).toEqual([
      { value: 69, label: 'ジャンプコミックス 31 卷', key: 0, original: true },
      { value: 70, label: '完全版 24 卷', key: 70, original: false },
    ])
  })

  it('counts a volume of no set as one of the original set', () => {
    expect(contentsSets([volume(1, null)], sets).map(option => option.value)).toEqual([69])
    expect(contentsSets([volume(1, null)], [])).toEqual([])
  })
})

describe('contentsSetKey', () => {
  const options = contentsSets([volume(1, reissue), volume(2, original)], sets)

  it('keeps the chosen set, otherwise picks the original', () => {
    expect(contentsSetKey(options, 70)).toBe(70)
    expect(contentsSetKey(options, null)).toBe(0)
    expect(contentsSetKey(options, 999)).toBe(0)
  })

  it('picks the only set that has volumes to read, and filters nothing without sets', () => {
    expect(contentsSetKey(contentsSets([volume(1, reissue)], sets), null)).toBe(70)
    expect(contentsSetKey([], null)).toBeNull()
  })
})

describe('contentsUnits by set', () => {
  it('keeps the volumes of the chosen set and every chapter', () => {
    const items = [
      { ...volume(9, null), chapter_type: 'SERIALIZATION', chapter_number: '1' } as ContentsItem,
      volume(1, original),
      volume(2, reissue),
      volume(3, null),
    ]
    expect(contentsUnits(items, 70).volume.map(item => item.id)).toEqual([2])
    expect(contentsUnits(items, 0).volume.map(item => item.id)).toEqual([1, 3])
    expect(contentsUnits(items, 0).chapter.map(item => item.id)).toEqual([9])
    expect(contentsUnits(items).volume.map(item => item.id)).toEqual([1, 2, 3])
  })
})
