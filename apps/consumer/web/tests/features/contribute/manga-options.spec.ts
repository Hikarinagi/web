import { describe, expect, it } from 'vitest'
import {
  chapterOptions,
  firstFree,
  NEW_TARGET,
  partOptions,
  volumeOptions,
  WHOLE_VOLUME,
} from '~/features/contribute/manga-options'
import type {
  MangaTargetChapter,
  MangaTargetClaim,
  MangaTargetVolume,
} from '~/features/contribute/manga-target'

function chapter(overrides: Partial<MangaTargetChapter> & { id: number }): MangaTargetChapter {
  return {
    chapter_type: 'SERIALIZATION',
    chapter_number: null,
    volume_number: null,
    volume_id: null,
    sort_key: overrides.id,
    name: null,
    name_cn: null,
    publication_date: null,
    page_count: 0,
    translation: null,
    cover: null,
    sources_count: 0,
    readable: false,
    ...overrides,
  } as MangaTargetChapter
}

function volume(overrides: Partial<MangaTargetVolume> & { id: number }): MangaTargetVolume {
  return {
    volume_number: null,
    name: null,
    name_cn: null,
    chapters: null,
    editions: [],
    ...overrides,
  }
}

function claim(overrides: Partial<MangaTargetClaim>): MangaTargetClaim {
  return {
    id: 0,
    scope: 'CHAPTER',
    chapter: null,
    volume_id: null,
    volume_number: null,
    part: null,
    part_count: null,
    owner: { id: 1, name: 'ichi', nickname: null },
    ...overrides,
  } as MangaTargetClaim
}

const edition = (title: string, note: string) => ({ entry_id: 1, title, note })

describe('chapterOptions', () => {
  it('只列没有内容的单话，进行中的不可选，末尾是新章节', () => {
    const options = chapterOptions(
      [
        chapter({ id: 1, chapter_number: '1' }),
        chapter({ id: 2, chapter_number: '2', page_count: 20 }),
        chapter({ id: 3, chapter_type: 'VOLUME', volume_number: 1 }),
        chapter({ id: 4, chapter_number: '4' }),
      ],
      [claim({ chapter: { id: 4 } as MangaTargetClaim['chapter'] })],
    )
    expect(options).toEqual([
      { value: 1, label: '第 1 话' },
      { value: 4, label: '第 4 话（进行中）', disabled: true },
      { value: NEW_TARGET, label: '新章节' },
    ])
  })
})

describe('volumeOptions', () => {
  const volumes = [
    volume({ id: 11, volume_number: 1 }),
    volume({ id: 12, volume_number: 2 }),
    volume({ id: 13, volume_number: 3 }),
    volume({ id: 14, volume_number: 4 }),
  ]

  it('已有整卷内容的卷标记为已收录，按卷号兜底匹配', () => {
    const options = volumeOptions(
      volumes,
      [
        chapter({ id: 1, chapter_type: 'VOLUME', volume_id: 11, page_count: 180 }),
        chapter({ id: 2, chapter_type: 'VOLUME', volume_number: 2, page_count: 160 }),
        chapter({ id: 3, chapter_type: 'VOLUME', volume_number: 3, page_count: 0 }),
      ],
      [],
    )
    expect(options.slice(0, 3)).toEqual([
      { value: 11, label: '第 1 卷', description: '已收录', disabled: true },
      { value: 12, label: '第 2 卷', description: '已收录', disabled: true },
      { value: 13, label: '第 3 卷' },
    ])
  })

  it('有进行中整卷项目的卷不可选，单话项目不影响', () => {
    const options = volumeOptions(
      volumes,
      [],
      [
        claim({ scope: 'VOLUME', volume_id: 12 }),
        claim({ scope: 'VOLUME', volume_number: 3 }),
        claim({ scope: 'CHAPTER', volume_number: 4 }),
      ],
    )
    expect(options).toEqual([
      { value: 11, label: '第 1 卷' },
      { value: 12, label: '第 2 卷', description: 'ichi 正在上传', disabled: true },
      { value: 13, label: '第 3 卷', description: 'ichi 正在上传', disabled: true },
      { value: 14, label: '第 4 卷' },
      { value: NEW_TARGET, label: '新建这一卷的条目…' },
    ])
  })

  it('列出每一卷收录的话数与注明了所收部分的电子版分册', () => {
    const options = volumeOptions(
      [
        volume({
          id: 13,
          volume_number: 3,
          chapters: { first: '017', last: '24', count: 8 },
          editions: [
            edition('隠し部屋（5）', '第 17 至 20 话'),
            edition('隠し部屋（6）', '第 21 至 24 话'),
          ],
        }),
        volume({ id: 14, volume_number: 4, chapters: { first: '25', last: '25', count: 1 } }),
      ],
      [],
      [],
    )
    expect(options.slice(0, 2)).toEqual([
      {
        value: 13,
        label: '第 3 卷',
        description: '第 17 至 24 话；隠し部屋（5）：第 17 至 20 话；隠し部屋（6）：第 21 至 24 话',
      },
      { value: 14, label: '第 4 卷', description: '第 25 话' },
    ])
  })

  it('只有部分投稿的卷仍可选，注明哪些部分已有投稿；整卷投稿占着的卷不可选', () => {
    const options = volumeOptions(
      [
        volume({ id: 13, volume_number: 3, chapters: { first: '17', last: '24', count: 8 } }),
        volume({ id: 14, volume_number: 4 }),
      ],
      [chapter({ id: 5, chapter_type: 'VOLUME', volume_id: 13, page_count: 44 })],
      [claim({ scope: 'VOLUME', volume_id: 14, owner: { id: 2, name: 'ni', nickname: null } })],
      {
        upload: true,
        published: [claim({ scope: 'VOLUME', volume_id: 13, part: 1, part_count: 2 })],
      },
    )
    expect(options.slice(0, 2)).toEqual([
      { value: 13, label: '第 3 卷', description: '第 17 至 24 话。第 1 部分已有投稿' },
      { value: 14, label: '第 4 卷', description: 'ni 正在上传', disabled: true },
    ])
  })
})

describe('partOptions', () => {
  const third = volume({
    id: 13,
    volume_number: 3,
    editions: [
      edition('隠し部屋（5）', '第 17 至 20 话'),
      edition('隠し部屋（6）', '第 21 至 24 话'),
    ],
  })

  it('部分数与电子版分册数一致时按顺序对应，别人占着的部分不可选，自己的不算', () => {
    const options = partOptions(2, third, {
      claims: [claim({ id: 7, scope: 'VOLUME', volume_id: 13, part: 2, part_count: 2 })],
      published: [claim({ id: 8, scope: 'VOLUME', volume_id: 13, part: 1, part_count: 2 })],
      selfId: 8,
    })
    expect(options).toEqual([
      { value: WHOLE_VOLUME, label: '整卷' },
      {
        value: 1,
        label: '第 1 部分',
        description: '隠し部屋（5）：第 17 至 20 话',
        disabled: false,
      },
      { value: 2, label: '第 2 部分', description: 'ichi 正在上传', disabled: true },
    ])
  })

  it('部分数与分册数不一致时不对应分册，没有部分数时只能选整卷', () => {
    expect(
      partOptions(3, third, { claims: [], published: [] }).map(item => item.description),
    ).toEqual([undefined, undefined, undefined, undefined])
    expect(partOptions(0, third, { claims: [], published: [] })).toEqual([
      { value: WHOLE_VOLUME, label: '整卷' },
    ])
  })
})

describe('firstFree', () => {
  it('返回第一个可选的卷或话，没有时返回 null', () => {
    expect(
      firstFree([
        { value: 1, label: 'a', disabled: true },
        { value: 2, label: 'b' },
        { value: NEW_TARGET, label: 'c' },
      ]),
    ).toBe(2)
    expect(firstFree([{ value: NEW_TARGET, label: 'c' }])).toBeNull()
  })
})
