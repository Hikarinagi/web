import { describe, expect, it } from 'vitest'
import {
  chapterOptions,
  firstFree,
  NEW_TARGET,
  volumeOptions,
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
    cover: null,
    isbn: null,
    page_count: null,
    publication_date: null,
    sort_key: overrides.id,
    ...overrides,
  } as MangaTargetVolume
}

function claim(overrides: Partial<MangaTargetClaim>): MangaTargetClaim {
  return {
    scope: 'CHAPTER',
    chapter: null,
    volume_id: null,
    volume_number: null,
    owner: { id: 1, name: 'ichi', nickname: null },
    ...overrides,
  } as MangaTargetClaim
}

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
      { value: 11, label: '第 1 卷（已收录）', disabled: true },
      { value: 12, label: '第 2 卷（已收录）', disabled: true },
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
      { value: 12, label: '第 2 卷（ichi 正在上传）', disabled: true },
      { value: 13, label: '第 3 卷（ichi 正在上传）', disabled: true },
      { value: 14, label: '第 4 卷' },
      { value: NEW_TARGET, label: '新建这一卷的条目…' },
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
