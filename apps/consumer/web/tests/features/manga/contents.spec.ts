import {
  chapterCells,
  chapterRanges,
  contentsUnits,
  continueTarget,
  defaultUnit,
  isNewItem,
  rangeOfItem,
  type ContentsItem,
  type ContentsProgress,
} from '~/features/manga/contents'

function item(id: number, over: Partial<ContentsItem> = {}): ContentsItem {
  return {
    id,
    chapter_type: 'SERIALIZATION',
    chapter_number: String(id),
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
    ...over,
  } as ContentsItem
}

function progress(id: number, over: Partial<ContentsProgress['chapter']> = {}): ContentsProgress {
  return {
    page: 3,
    chapter: {
      id,
      chapter_type: 'SERIALIZATION',
      chapter_number: String(id),
      volume_number: null,
      title: null,
      ordinal: 1,
      page_count: 20,
      ...over,
    },
    thumbnail: null,
    read_chapter_ids: [],
    updated_at: '2026-01-01T00:00:00.000Z',
  } as ContentsProgress
}

describe('contentsUnits', () => {
  it('groups readable items into chapters, volumes and extras', () => {
    const units = contentsUnits([
      item(1),
      item(2, { chapter_type: 'VOLUME', chapter_number: null, volume_number: 1 }),
      item(3, { chapter_type: 'EXTRA', chapter_number: null, title: '番外篇' }),
      item(4, { readable: false }),
    ])
    expect(units.chapter.map(entry => entry.id)).toEqual([1])
    expect(units.volume.map(entry => entry.id)).toEqual([2])
    expect(units.extra.map(entry => entry.id)).toEqual([3])
  })

  it('opens on the unit of the progress, otherwise chapters, volumes, extras', () => {
    const units = contentsUnits([
      item(2, { chapter_type: 'VOLUME', chapter_number: null, volume_number: 1 }),
      item(3, { chapter_type: 'EXTRA', chapter_number: null, title: 'x' }),
    ])
    expect(defaultUnit(units, 3)).toBe('extra')
    expect(defaultUnit(units, null)).toBe('volume')
  })
})

describe('chapter ranges and cells', () => {
  const long = Array.from({ length: 188 }, (_, index) => item(index + 1))

  it('splits more than 100 chapters by number', () => {
    expect(chapterRanges(long)).toEqual([
      { key: '0', label: '1–100' },
      { key: '1', label: '101–188' },
    ])
    expect(chapterRanges(long.slice(0, 100))).toEqual([])
    expect(rangeOfItem(long[156]!, chapterRanges(long))).toBe('1')
  })

  it('shows missing whole numbers as gaps and keeps decimals and repeats', () => {
    const chapters = [
      item(38),
      item(39),
      item(395, { chapter_number: '39.5' }),
      item(41),
      item(410, { chapter_number: '041', ordinal: 2 }),
    ]
    expect(
      chapterCells(chapters, null).map(cell =>
        cell.kind === 'gap' ? `gap ${cell.number}` : cell.item.chapter_number,
      ),
    ).toEqual(['38', '39', '39.5', 'gap 40', '41', '041'])
  })

  it('puts chapters without a numeric number into the last range', () => {
    const chapters = [...long, item(999, { chapter_number: 'web版' })]
    expect(chapterCells(chapters, '1').at(-1)).toMatchObject({ kind: 'item', key: 'item-999' })
    expect(chapterCells(chapters, '0').some(cell => cell.key === 'item-999')).toBe(false)
  })

  it('keeps the cells of the chosen range only', () => {
    const cells = chapterCells([...long.slice(0, 99), ...long.slice(100)], '0')
    expect(cells.at(-1)).toEqual({ kind: 'gap', key: 'gap-100', number: 100 })
    expect(cells).toHaveLength(100)
  })
})

describe('continueTarget', () => {
  const units = contentsUnits([
    item(1),
    item(2),
    item(9, { chapter_type: 'VOLUME', chapter_number: null, volume_number: 3 }),
  ])

  it('starts from the first chapter without progress', () => {
    expect(continueTarget(units, null, new Set())).toEqual({
      id: 1,
      label: '第 1 话',
      resume: false,
    })
  })

  it('resumes an unfinished item and moves on within the unit once it is read', () => {
    expect(continueTarget(units, progress(1), new Set())).toMatchObject({ id: 1, resume: true })
    expect(continueTarget(units, progress(1), new Set([1]))).toMatchObject({
      id: 2,
      label: '第 2 话',
    })
    expect(continueTarget(units, progress(2), new Set([2]))).toMatchObject({ id: 2 })
  })

  it('names a volume by its unit', () => {
    expect(
      continueTarget(
        units,
        progress(9, { chapter_type: 'VOLUME', chapter_number: null, volume_number: 3 }),
        new Set(),
      ),
    ).toMatchObject({ id: 9, label: '第 3 卷' })
  })
})

describe('isNewItem', () => {
  it('marks unread items added within seven days', () => {
    const now = Date.parse('2026-10-16T00:00:00.000Z')
    const fresh = item(1, { created_at: '2026-10-12T00:00:00.000Z' })
    expect(isNewItem(fresh, new Set(), now)).toBe(true)
    expect(isNewItem(fresh, new Set([1]), now)).toBe(false)
    expect(isNewItem(item(2), new Set(), now)).toBe(false)
  })
})
