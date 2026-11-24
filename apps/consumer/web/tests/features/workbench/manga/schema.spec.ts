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
  const base = { mode: 'UPLOAD', source_lang: 'zh-Hans' }

  it('卷号或话号可以不填，填了也不限写法', () => {
    expect(issues(createMangaProjectSchema, base)).toEqual([])
    expect(issues(createMangaProjectSchema, { ...base, hint: null })).toEqual([])
    expect(issues(createMangaProjectSchema, { ...base, hint: '第 17 至 20 话' })).toEqual([])
    expect(issues(createMangaProjectSchema, { ...base, hint: 'x'.repeat(41) })).toEqual([
      '卷号或话号不能超过 40 个字符',
    ])
  })

  it('翻译必须选与原文不同的译文语言', () => {
    expect(issues(createMangaProjectSchema, { ...base, mode: 'TRANSLATION' })).toEqual([
      '请选择译文语言',
    ])
    expect(
      issues(createMangaProjectSchema, { ...base, mode: 'TRANSLATION', target_lang: 'zh-Hans' }),
    ).toEqual(['译文语言不能与原文语言相同'])
    expect(
      issues(createMangaProjectSchema, { ...base, mode: 'TRANSLATION', target_lang: 'ja' }),
    ).toEqual([])
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
    expect(issues(mangaVolumeInfoSchema, { volume_id: null })).toEqual(['请选择单行本'])
    expect(issues(mangaVolumeInfoSchema, { volume_id: 2 })).toEqual([])
  })
})
