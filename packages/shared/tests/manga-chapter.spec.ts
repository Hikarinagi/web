import {
  mangaChapterCompare,
  mangaChapterHeading,
  mangaChapterLabel,
  mangaChapterNumber,
  mangaChapterOrdinals,
  mangaChapterTitle,
  mangaReadingUnit,
  type MangaChapterKind,
} from '../src/manga-chapter'

function item(
  id: number,
  chapter_type: MangaChapterKind,
  over: Partial<{
    chapter_number: string | null
    volume_number: number | null
    title: string | null
    sort_key: number
  }> = {},
) {
  return {
    id,
    chapter_type,
    chapter_number: null,
    volume_number: null,
    title: null,
    sort_key: id,
    ...over,
  }
}

describe('mangaChapterNumber', () => {
  it('drops leading zeros and keeps decimals', () => {
    expect(mangaChapterNumber('01')).toBe('1')
    expect(mangaChapterNumber('000')).toBe('0')
    expect(mangaChapterNumber('039.5')).toBe('39.5')
    expect(mangaChapterNumber('6.10')).toBe('6.10')
    expect(mangaChapterNumber(' 12 ')).toBe('12')
  })
})

describe('mangaChapterLabel', () => {
  it('labels chapters and volumes by number only', () => {
    expect(
      mangaChapterLabel(item(1, 'SERIALIZATION', { chapter_number: '01', title: '出发' })),
    ).toBe('第 1 话')
    expect(mangaChapterLabel(item(2, 'VOLUME', { volume_number: 3 }))).toBe('第 3 卷')
  })

  it('labels extras by title and never reads 未命名', () => {
    expect(mangaChapterLabel(item(3, 'EXTRA', { title: '动画宣传' }))).toBe('动画宣传')
    expect(mangaChapterLabel(item(4, 'EXTRA'))).toBe('番外')
    expect(mangaChapterLabel(item(5, 'VOLUME'))).toBe('单行本')
  })

  it('adds the ordinal for repeated numbers and titles', () => {
    expect(
      mangaChapterLabel({ ...item(6, 'SERIALIZATION', { chapter_number: '35' }), ordinal: 2 }),
    ).toBe('第 35 话（2）')
    expect(mangaChapterLabel({ ...item(7, 'EXTRA', { title: '动画宣传' }), ordinal: 2 })).toBe(
      '动画宣传（2）',
    )
    expect(mangaChapterLabel({ ...item(8, 'VOLUME', { volume_number: 1 }), ordinal: 1 })).toBe(
      '第 1 卷',
    )
  })

  it('puts the name of another set before a volume and leaves a volume of the original bare', () => {
    const reissue = { id: 70, name: '完全版', original: false }
    expect(
      mangaChapterLabel({ ...item(15, 'VOLUME', { volume_number: 3 }), volume_set: reissue }),
    ).toBe('完全版 第 3 卷')
    expect(
      mangaChapterLabel({
        ...item(16, 'VOLUME', { volume_number: 3 }),
        volume_set: { id: 69, name: 'ジャンプコミックス', original: true },
      }),
    ).toBe('第 3 卷')
    expect(
      mangaChapterLabel({
        ...item(17, 'VOLUME', { title: '総集編' }),
        volume_set: reissue,
      }),
    ).toBe('完全版 総集編')
    expect(
      mangaChapterLabel({
        ...item(18, 'SERIALIZATION', { chapter_number: '3' }),
        volume_set: reissue,
      }),
    ).toBe('第 3 话')
  })

  it('treats one-shots as chapters', () => {
    expect(mangaReadingUnit('ONESHOT')).toBe('chapter')
    expect(mangaChapterLabel(item(9, 'ONESHOT', { chapter_number: '2' }))).toBe('第 2 话')
  })
})

describe('mangaChapterHeading', () => {
  it('appends a real title to chapters and volumes', () => {
    expect(
      mangaChapterHeading(item(1, 'SERIALIZATION', { chapter_number: '12', title: '出发' })),
    ).toBe('第 12 话 · 出发')
    expect(mangaChapterHeading(item(2, 'VOLUME', { volume_number: 2, title: '夏' }))).toBe(
      '第 2 卷 · 夏',
    )
    expect(mangaChapterHeading(item(3, 'EXTRA', { title: '番外篇' }))).toBe('番外篇')
    expect(mangaChapterHeading(item(4, 'SERIALIZATION', { chapter_number: '3' }))).toBe('第 3 话')
  })

  it('does not repeat the title of an unnumbered volume of another set', () => {
    expect(
      mangaChapterHeading({
        ...item(5, 'VOLUME', { title: '総集編' }),
        volume_set: { id: 70, name: '完全版', original: false },
      }),
    ).toBe('完全版 総集編')
  })
})

describe('mangaChapterCompare', () => {
  it('orders units, then chapters by number, volumes by volume and extras by position', () => {
    const list = [
      item(1, 'EXTRA', { title: 'b', sort_key: 9 }),
      item(2, 'VOLUME', { volume_number: 2, sort_key: 1 }),
      item(3, 'SERIALIZATION', { chapter_number: '10', sort_key: 1 }),
      item(4, 'SERIALIZATION', { chapter_number: '9.5', sort_key: 50 }),
      item(5, 'VOLUME', { volume_number: 1, sort_key: 7 }),
      item(6, 'EXTRA', { title: 'a', sort_key: 2 }),
      item(7, 'SERIALIZATION', { chapter_number: '02', sort_key: 3 }),
    ]
    expect([...list].sort(mangaChapterCompare).map(entry => entry.id)).toEqual([
      7, 4, 3, 5, 2, 6, 1,
    ])
  })

  it('keeps the volumes of the original set ahead and the volumes of each other set together', () => {
    const original = { id: 69, original: true }
    const reissue = { id: 70, original: false }
    const list = [
      { ...item(1, 'VOLUME', { volume_number: 1 }), volume_set: reissue },
      { ...item(2, 'VOLUME', { volume_number: 2 }), volume_set: original },
      { ...item(3, 'VOLUME', { volume_number: 1 }), volume_set: original },
      { ...item(4, 'VOLUME', { volume_number: 2 }), volume_set: reissue },
      item(5, 'VOLUME', { volume_number: 3 }),
    ]
    expect([...list].sort(mangaChapterCompare).map(entry => entry.id)).toEqual([3, 2, 5, 1, 4])
  })
})

describe('mangaChapterOrdinals', () => {
  it('numbers repeats in unit order', () => {
    const ordinals = mangaChapterOrdinals([
      item(1, 'SERIALIZATION', { chapter_number: '8', sort_key: 20 }),
      item(2, 'SERIALIZATION', { chapter_number: '08', sort_key: 10 }),
      item(3, 'EXTRA', { title: '动画宣传', sort_key: 5 }),
      item(4, 'EXTRA', { title: '动画宣传', sort_key: 9 }),
      item(5, 'SERIALIZATION', { chapter_number: '6.1' }),
      item(6, 'SERIALIZATION', { chapter_number: '6.10' }),
    ])
    expect(ordinals.get(2)).toBe(1)
    expect(ordinals.get(1)).toBe(2)
    expect(ordinals.get(3)).toBe(1)
    expect(ordinals.get(4)).toBe(2)
    expect(ordinals.get(5)).toBe(1)
    expect(ordinals.get(6)).toBe(1)
  })

  it('counts a volume number once in each set', () => {
    const ordinals = mangaChapterOrdinals([
      { ...item(1, 'VOLUME', { volume_number: 1 }), volume_set: { id: 69, original: true } },
      { ...item(2, 'VOLUME', { volume_number: 1 }), volume_set: { id: 70, original: false } },
      { ...item(3, 'VOLUME', { volume_number: 1, sort_key: 9 }), volume_set: null },
    ])
    expect(ordinals.get(1)).toBe(1)
    expect(ordinals.get(2)).toBe(1)
    expect(ordinals.get(3)).toBe(2)
  })
})

describe('mangaChapterTitle', () => {
  it('drops names that only repeat the number', () => {
    const chapter = {
      chapter_type: 'SERIALIZATION' as const,
      chapter_number: '01',
      volume_number: null,
    }
    expect(mangaChapterTitle('第01话', chapter)).toBeNull()
    expect(mangaChapterTitle('第 1 話', chapter)).toBeNull()
    expect(mangaChapterTitle('CH01', chapter)).toBeNull()
    expect(mangaChapterTitle('１', chapter)).toBeNull()
    expect(mangaChapterTitle('  ', chapter)).toBeNull()
    expect(mangaChapterTitle('出发', chapter)).toBe('出发')
    expect(mangaChapterTitle('第01话 出发', chapter)).toBe('第01话 出发')
  })

  it('drops volume labels and keeps every extra title', () => {
    const volume = { chapter_type: 'VOLUME' as const, chapter_number: null, volume_number: 3 }
    expect(mangaChapterTitle('第03卷', volume)).toBeNull()
    expect(mangaChapterTitle('Vol.3', volume)).toBeNull()
    expect(mangaChapterTitle('完全版3卷', volume)).toBe('完全版3卷')
    const extra = { chapter_type: 'EXTRA' as const, chapter_number: null, volume_number: null }
    expect(mangaChapterTitle('第5卷番外', extra)).toBe('第5卷番外')
  })
})
