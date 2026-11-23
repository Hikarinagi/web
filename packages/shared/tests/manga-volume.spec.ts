import {
  mangaSetKey,
  mangaSetName,
  mangaVolumeEntryFor,
  mangaVolumeNumberOf,
  mangaVolumeNumbers,
  type MangaVolumeNumberSource,
} from '../src/manga-volume'

function entry(
  id: number,
  name: string | null,
  over: Partial<MangaVolumeNumberSource> = {},
): MangaVolumeNumberSource {
  return {
    id,
    volume_number: null,
    name,
    name_cn: null,
    sort_key: id,
    publication_date: null,
    ...over,
  }
}

describe('mangaVolumeNumbers', () => {
  it('prefers the stored volume number', () => {
    const map = mangaVolumeNumbers([entry(1, '第 3 卷', { volume_number: 7 }), entry(2, '(2)')])
    expect([...map]).toEqual([
      [7, 1],
      [2, 2],
    ])
  })

  it('reads numbers from parentheses, 第N卷, N巻, vol and trailing numbers', () => {
    const map = mangaVolumeNumbers([
      entry(1, 'HUNTER×HUNTER (1) 出発の日'),
      entry(2, 'ドラえもん 0巻'),
      entry(3, '火の鳥 7・乱世編(上)'),
      entry(4, 'タコピーの原罪 第１２巻'),
      entry(5, 'Vol. 9'),
      entry(6, 'ヒストリエ 11'),
    ])
    expect(map.get(1)).toBe(1)
    expect(map.get(0)).toBe(2)
    expect(map.get(7)).toBe(3)
    expect(map.get(12)).toBe(4)
    expect(map.get(9)).toBe(5)
    expect(map.get(11)).toBe(6)
  })

  it('maps 上／下 pairs and falls back to the entry order when nothing is numbered', () => {
    expect([
      ...mangaVolumeNumbers([
        entry(2, 'タコピーの原罪 (下)', { sort_key: 1 }),
        entry(1, 'タコピーの原罪 (上)', { sort_key: 0 }),
      ]),
    ]).toEqual([
      [1, 1],
      [2, 2],
    ])
    expect([
      ...mangaVolumeNumbers([
        entry(5, '黎明編', { sort_key: 0, publication_date: '2020-01-01' }),
        entry(6, '未来編', { sort_key: 0, publication_date: '2020-06-01' }),
        entry(7, '別巻', { sort_key: 1 }),
      ]),
    ]).toEqual([
      [1, 5],
      [2, 6],
      [3, 7],
    ])
  })

  it('keeps the first entry when two resolve to the same number', () => {
    const map = mangaVolumeNumbers([entry(1, '第 1 卷'), entry(2, '第 1 卷 新装版')])
    expect(map.get(1)).toBe(1)
    expect(map.size).toBe(1)
  })
})

describe('mangaVolumeEntryFor and mangaVolumeNumberOf', () => {
  const entries = [entry(1, '(上)'), entry(2, '(下)')]

  it('resolves both directions', () => {
    expect(mangaVolumeEntryFor(entries, 2)).toBe(2)
    expect(mangaVolumeEntryFor(entries, 3)).toBeNull()
    expect(mangaVolumeEntryFor(entries, null)).toBeNull()
    expect(mangaVolumeNumberOf(entries, 1)).toBe(1)
    expect(mangaVolumeNumberOf(entries, 9)).toBeNull()
  })
})

describe('mangaSetName', () => {
  const set = (over: Partial<Parameters<typeof mangaSetName>[0]> = {}) => ({
    name: null,
    original: false,
    labels: [],
    publishers: [],
    ...over,
  })

  it('takes the recorded name, then the label, then the publisher', () => {
    expect(mangaSetName(set({ name: '完全版', labels: [{ name: '少年ジャンプ' }] }))).toBe('完全版')
    expect(
      mangaSetName(set({ labels: [{ name: '秋田文庫' }], publishers: [{ name: '秋田書店' }] })),
    ).toBe('秋田文庫')
    expect(mangaSetName(set({ publishers: [{ name: '集英社' }] }))).toBe('集英社')
  })

  it('falls back on whether the set is the original', () => {
    expect(mangaSetName(set({ original: true }))).toBe('原版')
    expect(mangaSetName(set())).toBe('其他版本')
  })
})

describe('mangaSetKey', () => {
  it('groups the original set with volumes of no set and keys any other set by its id', () => {
    expect(mangaSetKey({ volume_set: null })).toBe(0)
    expect(mangaSetKey({})).toBe(0)
    expect(mangaSetKey({ volume_set: { id: 69, original: true } })).toBe(0)
    expect(mangaSetKey({ volume_set: { id: 70, original: false } })).toBe(70)
  })
})
