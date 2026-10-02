import { chaptersInVolume, volumeCards, wholeVolumeOf } from '~/features/manga/volumes'
import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

type Chapter = MangaPageData['chapters'][number]
type VolumeEntry = MangaPageData['volumes'][number]

function chapter(overrides: Partial<Chapter> & { id: number }): Chapter {
  return {
    chapter_type: 'SERIALIZATION',
    chapter_number: null,
    volume_number: null,
    volume_id: null,
    sort_key: overrides.id,
    name: null,
    name_cn: null,
    publication_date: null,
    page_count: 20,
    cover: null,
    sources_count: 1,
    translation: null,
    readable: true,
    ...overrides,
  } as Chapter
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
  entry({ id: 821, volume_number: 1, publication_date: '2015-10-24' }),
  entry({ id: 822, volume_number: 2, publication_date: '2016-04-26' }),
  entry({ id: 823, volume_number: 3 }),
]
const chapters = [
  chapter({ id: 1, chapter_type: 'VOLUME', volume_number: 1, volume_id: 821, page_count: 179 }),
  chapter({ id: 2, chapter_type: 'VOLUME', volume_number: 2, volume_id: null, page_count: 179 }),
  chapter({ id: 9, chapter_type: 'VOLUME', volume_number: 9, name: '第09卷', page_count: 180 }),
  chapter({ id: 23, chapter_number: '23', volume_number: 3 }),
  chapter({ id: 24, chapter_number: '24', volume_id: 823 }),
  chapter({ id: 25, chapter_number: '25' }),
  chapter({ id: 30, chapter_type: 'EXTRA', name: '番外1', volume_number: 3 }),
]

it('把单行本条目与整卷章节按卷号合成卡片，并补上没有条目的整卷', () => {
  const cards = volumeCards(volumes, chapters)
  expect(cards.map(c => c.title)).toEqual(['第 1 卷', '第 2 卷', '第 3 卷', '第 9 卷'])
  expect(cards[0]).toMatchObject({ entry: volumes[0], whole: chapters[0], year: '2015 年' })
  expect(cards[1]?.whole?.id).toBe(2)
  expect(cards[2]).toMatchObject({ whole: null, episode_count: 3 })
  expect(cards[3]).toMatchObject({ entry: null, whole: chapters[2], volume_number: 9 })
})

it('按条目 id 优先、卷号其次找到整卷与所属话', () => {
  expect(wholeVolumeOf(chapters, volumes[1]!)?.id).toBe(2)
  expect(chaptersInVolume(chapters, volumes[2]!).map(c => c.id)).toEqual([23, 24, 30])
  expect(chaptersInVolume(chapters, { id: 999, volume_number: 8 })).toEqual([])
})

it('没有卷号的条目按名字或顺序和整卷章节合并成一张卡片', () => {
  const entries = [
    entry({ id: 11, volume_number: null, name: 'タコピーの原罪 (上)', sort_key: 0 }),
    entry({ id: 12, volume_number: null, name: 'タコピーの原罪 (下)', sort_key: 1 }),
  ]
  const wholes = [
    chapter({ id: 1, chapter_type: 'VOLUME', volume_number: 1, page_count: 224, readable: true }),
    chapter({ id: 2, chapter_type: 'VOLUME', volume_number: 2, page_count: 208, readable: true }),
  ]
  const cards = volumeCards(entries, wholes)
  expect(cards.map(card => [card.key, card.title, card.whole?.id, card.volume_number])).toEqual([
    ['entry-11', 'タコピーの原罪 (上)', 1, 1],
    ['entry-12', 'タコピーの原罪 (下)', 2, 2],
  ])
  expect(wholeVolumeOf(wholes, entries[1]!, entries)?.id).toBe(2)
  expect(
    chaptersInVolume([chapter({ id: 3, volume_number: 1 })], entries[0]!, entries).map(c => c.id),
  ).toEqual([3])
})
