import { chaptersInVolume, wholeVolumeOf } from '~/features/manga/volumes'
import type { ContentsItem } from '~/features/manga/contents'
import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

type VolumeEntry = MangaPageData['volumes'][number]

function chapter(overrides: Partial<ContentsItem> & { id: number }): ContentsItem {
  return {
    chapter_type: 'SERIALIZATION',
    chapter_number: null,
    volume_number: null,
    volume_id: null,
    title: null,
    ordinal: 1,
    publication_date: null,
    page_count: 20,
    created_at: '2026-01-01T00:00:00.000Z',
    cover: null,
    readable: true,
    guest_readable: true,
    editable: false,
    ...overrides,
  } as ContentsItem
}

function entry(overrides: Partial<VolumeEntry> & { id: number }): VolumeEntry {
  return {
    volume_number: null,
    name: null,
    name_cn: null,
    cover: null,
    isbn: null,
    publication_date: null,
    page_count: null,
    sort_key: overrides.id,
    ...overrides,
  } as VolumeEntry
}

const volumes = [
  entry({ id: 821, volume_number: 1 }),
  entry({ id: 822, volume_number: 2 }),
  entry({ id: 823, volume_number: 3 }),
]
const chapters = [
  chapter({ id: 1, chapter_type: 'VOLUME', volume_number: 1, volume_id: 821, page_count: 179 }),
  chapter({ id: 2, chapter_type: 'VOLUME', volume_number: 2, volume_id: null, page_count: 179 }),
  chapter({ id: 23, chapter_number: '23', volume_number: 3 }),
  chapter({ id: 24, chapter_number: '24', volume_id: 823 }),
  chapter({ id: 25, chapter_number: '25' }),
  chapter({ id: 30, chapter_type: 'EXTRA', title: '番外1', volume_number: 3 }),
]

it('按条目 id 优先、卷号其次找到整卷与所属话', () => {
  expect(wholeVolumeOf(chapters, volumes[1]!)?.id).toBe(2)
  expect(chaptersInVolume(chapters, volumes[2]!).map(c => c.id)).toEqual([23, 24, 30])
  expect(chaptersInVolume(chapters, { id: 999, volume_number: 8 })).toEqual([])
})

it('没有卷号的条目按名字或顺序找到整卷', () => {
  const entries = [
    entry({ id: 11, volume_number: null, name: 'タコピーの原罪 (上)', sort_key: 0 }),
    entry({ id: 12, volume_number: null, name: 'タコピーの原罪 (下)', sort_key: 1 }),
  ]
  const wholes = [
    chapter({ id: 1, chapter_type: 'VOLUME', volume_number: 1, page_count: 224 }),
    chapter({ id: 2, chapter_type: 'VOLUME', volume_number: 2, page_count: 208 }),
  ]
  expect(wholeVolumeOf(wholes, entries[1]!, entries)?.id).toBe(2)
  expect(
    chaptersInVolume([chapter({ id: 3, volume_number: 1 })], entries[0]!, entries).map(c => c.id),
  ).toEqual([3])
})
