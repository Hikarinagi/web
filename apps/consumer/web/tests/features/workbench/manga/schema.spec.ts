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
  const base = { mode: 'UPLOAD', scope: 'CHAPTER', chapter_id: null, source_lang: 'zh-Hans' }

  it('新章节既无话数也无标题时不通过', () => {
    expect(
      issues(createMangaProjectSchema, { ...base, chapter_number: ' ', chapter_name: '' }),
    ).toEqual(['请填写话数或标题'])
  })

  it('只填标题或只填话数都通过，选已有章节时不要求', () => {
    expect(issues(createMangaProjectSchema, { ...base, chapter_name: '番外篇' })).toEqual([])
    expect(issues(createMangaProjectSchema, { ...base, chapter_number: '12' })).toEqual([])
    expect(issues(createMangaProjectSchema, { ...base, chapter_id: 7 })).toEqual([])
  })

  it('整卷范围只要求选了单行本或填了卷号', () => {
    expect(issues(createMangaProjectSchema, { ...base, scope: 'VOLUME', volume_id: 3 })).toEqual([])
    expect(issues(createMangaProjectSchema, { ...base, scope: 'VOLUME' })).toEqual([
      '请选择单行本或填写卷号',
    ])
  })
})

describe('章节信息表单', () => {
  it('单话的话数与标题至少一项', () => {
    expect(issues(mangaChapterInfoSchema, { chapter_number: '', chapter_name: '' })).toEqual([
      '请填写话数或标题',
    ])
    expect(issues(mangaChapterInfoSchema, { chapter_number: '', chapter_name: '番外' })).toEqual([])
  })

  it('整卷必须有卷号', () => {
    expect(issues(mangaVolumeInfoSchema, { volume_number: null })).toEqual(['请填写卷号'])
    expect(issues(mangaVolumeInfoSchema, { volume_number: 2 })).toEqual([])
  })
})
