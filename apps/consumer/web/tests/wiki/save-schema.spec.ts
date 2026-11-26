import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { evidenceSchema } from '~/features/wiki/schemas/save.schema'

const issues = (values: unknown) =>
  (v.safeParse(evidenceSchema, values).issues ?? []).map(issue => [
    issue.path?.map(item => item.key).join('.'),
    issue.message,
  ])

describe('evidenceSchema', () => {
  it('asks for the address and the excerpt of the contradicting source', () => {
    expect(issues({ 11: { reason: 'CONTRADICTED', url: ' ', excerpt: '' } })).toEqual([
      ['11.url', '请填写来源网址'],
      ['11.excerpt', '请填写摘录'],
    ])
    expect(
      issues({
        11: { reason: 'CONTRADICTED', url: 'project-navel.com', excerpt: '略称は「つり乙」' },
      }),
    ).toEqual([['11.url', '网址应以 http:// 或 https:// 开头']])
  })

  it('asks for the source that shows a value belongs to another entry', () => {
    expect(issues({ 12: { reason: 'WRONG_ENTRY', url: '', excerpt: '' } })).toEqual([
      ['12.url', '请填写来源网址'],
      ['12.excerpt', '请填写摘录'],
    ])
  })

  it('passes filled evidence and a draft that deletes nothing with a reason needing it', () => {
    expect(
      issues({
        11: {
          reason: 'CONTRADICTED',
          url: 'https://project-navel.com/tsukiniyorisou/outline.html',
          excerpt: '略称は「つり乙」',
        },
        12: {
          reason: 'WRONG_ENTRY',
          url: 'https://www.omuroke.com/',
          excerpt: '劇場アニメ『大室家』',
        },
      }),
    ).toEqual([])
    expect(issues({})).toEqual([])
  })
})
