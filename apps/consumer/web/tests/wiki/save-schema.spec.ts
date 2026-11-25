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

  it('asks where a value deleted as unverifiable was looked for', () => {
    expect(issues({ 12: { reason: 'BAD_SOURCE', searched: '  ' } })).toEqual([
      ['12.searched', '请写明查过哪些地方'],
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
        12: { reason: 'BAD_SOURCE', searched: '官网、Steam 商店页与发售公告均无此名称' },
      }),
    ).toEqual([])
    expect(issues({})).toEqual([])
  })
})
