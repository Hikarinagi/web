import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { contradictingSchema } from '~/features/wiki/schemas/save.schema'

const issues = (values: unknown) =>
  (v.safeParse(contradictingSchema, values).issues ?? []).map(issue => [
    issue.path?.map(item => item.key).join('.'),
    issue.message,
  ])

describe('contradictingSchema', () => {
  it('asks for the address and the excerpt of the contradicting source', () => {
    expect(issues({ 11: { url: ' ', excerpt: '' } })).toEqual([
      ['11.url', '请填写来源网址'],
      ['11.excerpt', '请填写摘录'],
    ])
    expect(issues({ 11: { url: 'project-navel.com', excerpt: '略称は「つり乙」' } })).toEqual([
      ['11.url', '网址应以 http:// 或 https:// 开头'],
    ])
  })

  it('passes a source with both filled and a draft that deletes nothing as wrong', () => {
    expect(
      issues({
        11: {
          url: 'https://project-navel.com/tsukiniyorisou/outline.html',
          excerpt: '略称は「つり乙」',
        },
      }),
    ).toEqual([])
    expect(issues({})).toEqual([])
  })
})
