import { describe, expect, it } from 'vitest'
import {
  contentsStatus,
  contentsUnits,
  continueTarget,
  type ContentsItem,
  type ContentsProgress,
} from '~/features/manga/contents'
import { contentsGroups, type MangaVolumeSet } from '~/features/manga/sets'
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

const renewed = { id: 71, name: '新装版', original: false }

describe('contentsUnits by set', () => {
  it('keeps every readable volume, the original set first and the others in the order of the sets', () => {
    const items = [
      { ...volume(9, null), chapter_type: 'SERIALIZATION', chapter_number: '1' } as ContentsItem,
      volume(1, renewed),
      volume(2, reissue),
      volume(3, original),
      volume(4, null),
      volume(5, reissue, { readable: false }),
    ]
    expect(contentsUnits(items, sets).volume.map(item => item.id)).toEqual([3, 4, 2, 1])
    expect(contentsUnits(items, sets).chapter.map(item => item.id)).toEqual([9])
    expect(contentsUnits(items).volume.map(item => item.id)).toEqual([3, 4, 1, 2])
  })
})

describe('contentsGroups', () => {
  it('groups the volumes by set, names each group and counts a volume of no set as the original', () => {
    const groups = contentsGroups(
      contentsUnits([volume(1, reissue), volume(2, original), volume(3, null)], sets).volume,
    )
    expect(
      groups.map(({ key, name, original, items }) => [key, name, original, items.length]),
    ).toEqual([
      [0, 'ジャンプコミックス', true, 2],
      [70, '完全版', false, 1],
    ])
  })

  it('makes one group when only one set has volumes, and names a group with no set', () => {
    expect(contentsGroups([volume(1, reissue)]).map(group => [group.name, group.original])).toEqual(
      [['完全版', false]],
    )
    expect(contentsGroups([volume(1, null)]).map(group => [group.name, group.original])).toEqual([
      ['原版', true],
    ])
    expect(contentsGroups([])).toEqual([])
  })
})

describe('reading across sets', () => {
  const units = contentsUnits(
    [volume(1, original), volume(2, original), volume(11, reissue), volume(12, reissue)],
    sets,
  )
  const progress = (id: number) =>
    ({ chapter: { id }, page: 3, read_chapter_ids: [] }) as unknown as ContentsProgress

  it('continues with the next volume of the same set and never crosses into another set', () => {
    expect(continueTarget(units, progress(1), new Set([1]))).toMatchObject({ id: 2 })
    expect(continueTarget(units, progress(2), new Set([2]))).toMatchObject({ id: 2 })
    expect(continueTarget(units, progress(11), new Set([11]))).toMatchObject({ id: 12 })
    expect(continueTarget(units, null, new Set())).toMatchObject({ id: 1, resume: false })
  })

  it('describes the first set in the status', () => {
    expect(contentsStatus(units, true)).toBe('全 2 卷')
    expect(contentsStatus(contentsUnits([volume(11, reissue)], sets), false)).toBe(
      '更新至 完全版 第 11 卷',
    )
  })
})
