import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import {
  createMangaProjectSchema,
  mangaChapterInfoSchema,
  mangaVolumeInfoSchema,
} from '~/features/workbench/manga/schemas/manga.schema'

const issues = (schema: Parameters<typeof v.safeParse>[0], input: unknown) =>
  (v.safeParse(schema, input).issues ?? []).map(issue => issue.message)

describe('createMangaProjectSchema', () => {
  const base = {
    mode: 'UPLOAD',
    scope: 'CHAPTER',
    chapter_id: null,
    chapter_type: 'SERIALIZATION',
    source_lang: 'zh-Hans',
  }

  it('连载的新章节必须有话数', () => {
    expect(
      issues(createMangaProjectSchema, { ...base, chapter_number: ' ', chapter_name: '' }),
    ).toEqual(['请填写话数'])
    expect(issues(createMangaProjectSchema, { ...base, chapter_name: '再会' })).toEqual([
      '请填写话数',
    ])
    expect(issues(createMangaProjectSchema, { ...base, chapter_number: '12' })).toEqual([])
    expect(issues(createMangaProjectSchema, { ...base, chapter_number: '12.5' })).toEqual([])
  })

  it('番外与单篇必须有标题，选已有章节时不要求', () => {
    expect(
      issues(createMangaProjectSchema, { ...base, chapter_type: 'EXTRA', chapter_name: '番外篇' }),
    ).toEqual([])
    expect(
      issues(createMangaProjectSchema, { ...base, chapter_type: 'ONESHOT', chapter_name: '' }),
    ).toEqual(['请填写标题'])
    expect(
      issues(createMangaProjectSchema, { ...base, chapter_type: 'EXTRA', chapter_number: '12.5' }),
    ).toEqual(['请填写标题'])
    expect(issues(createMangaProjectSchema, { ...base, chapter_id: 7 })).toEqual([])
  })

  it('话数只收数字', () => {
    expect(issues(createMangaProjectSchema, { ...base, chapter_number: '3卷' })).toEqual([
      '话数只填数字，例如 12 或 12.5',
    ])
  })

  it('整卷范围必须选单行本', () => {
    expect(issues(createMangaProjectSchema, { ...base, scope: 'VOLUME', volume_id: 3 })).toEqual([])
    expect(issues(createMangaProjectSchema, { ...base, scope: 'VOLUME' })).toEqual(['请选择单行本'])
  })

  it('电子分册要选单行本、填第几册与共几册，第几册不能超过共几册', () => {
    const split = { ...base, scope: 'SPLIT', volume_id: 3 }
    expect(issues(createMangaProjectSchema, { ...split, part: 2, part_count: 2 })).toEqual([])
    expect(
      issues(createMangaProjectSchema, { ...base, scope: 'SPLIT', part: 1, part_count: 2 }),
    ).toEqual(['请选择单行本'])
    expect(issues(createMangaProjectSchema, { ...split, part: 2 })).toEqual(['请填写共几册'])
    expect(issues(createMangaProjectSchema, { ...split, part_count: 2 })).toEqual(['请填写第几册'])
    expect(issues(createMangaProjectSchema, { ...split, part: 3, part_count: 2 })).toEqual([
      '第几册不能大于共几册',
    ])
    expect(issues(createMangaProjectSchema, { ...split, part: 1, part_count: 1 })).toEqual([
      '共几册至少为 2',
    ])
  })

  it('整卷投稿不要求第几册', () => {
    expect(issues(createMangaProjectSchema, { ...base, scope: 'VOLUME', volume_id: 3 })).toEqual([])
  })
})

describe('章节信息表单', () => {
  it('连载必须有话数，番外必须有标题', () => {
    expect(
      issues(mangaChapterInfoSchema, {
        chapter_type: 'SERIALIZATION',
        chapter_number: '',
        chapter_name: '再会',
      }),
    ).toEqual(['请填写话数'])
    expect(
      issues(mangaChapterInfoSchema, {
        chapter_type: 'EXTRA',
        chapter_number: '',
        chapter_name: '',
      }),
    ).toEqual(['请填写标题'])
    expect(
      issues(mangaChapterInfoSchema, {
        chapter_type: 'EXTRA',
        chapter_number: '',
        chapter_name: '番外',
        volume_id: 4,
      }),
    ).toEqual([])
  })

  it('话数不是数字时不通过', () => {
    expect(
      issues(mangaChapterInfoSchema, {
        chapter_type: 'SERIALIZATION',
        chapter_number: '3卷',
        chapter_name: '',
      }),
    ).toEqual(['话数只填数字，例如 12 或 12.5'])
  })

  it('整卷必须选单行本', () => {
    expect(issues(mangaVolumeInfoSchema, { scope: 'VOLUME', volume_id: null })).toEqual([
      '请选择单行本',
    ])
    expect(issues(mangaVolumeInfoSchema, { scope: 'VOLUME', volume_id: 2 })).toEqual([])
    expect(
      issues(mangaVolumeInfoSchema, { scope: 'SPLIT', volume_id: 2, part: 1, part_count: 2 }),
    ).toEqual([])
    expect(issues(mangaVolumeInfoSchema, { scope: 'SPLIT', volume_id: 2, part: 1 })).toEqual([
      '请填写共几册',
    ])
  })
})
