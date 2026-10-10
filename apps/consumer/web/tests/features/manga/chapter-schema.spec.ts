import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { mangaChapterEditSchema } from '~/features/manga/schemas/chapter.schema'

const issues = (input: unknown) =>
  (v.safeParse(mangaChapterEditSchema, input).issues ?? []).map(issue => issue.message)

describe('mangaChapterEditSchema', () => {
  it('连载要话数，番外与单篇要标题，整卷要单行本', () => {
    expect(issues({ chapter_type: 'SERIALIZATION', chapter_number: '' })).toEqual(['请填写话数'])
    expect(issues({ chapter_type: 'EXTRA', name: '' })).toEqual(['请填写标题'])
    expect(issues({ chapter_type: 'ONESHOT', name: '短篇' })).toEqual([])
    expect(issues({ chapter_type: 'VOLUME', volume_id: null })).toEqual(['请选择单行本'])
    expect(issues({ chapter_type: 'VOLUME', volume_id: 3 })).toEqual([])
  })

  it('话数只收数字，标题两端空白去掉', () => {
    expect(issues({ chapter_type: 'SERIALIZATION', chapter_number: '3卷' })).toEqual([
      '话数只填数字，例如 12 或 12.5',
    ])
    const parsed = v.safeParse(mangaChapterEditSchema, {
      chapter_type: 'EXTRA',
      name: ' 番外 ',
      publication_date: null,
    })
    expect(parsed.success && parsed.output).toMatchObject({ name: '番外', publication_date: '' })
  })
})
