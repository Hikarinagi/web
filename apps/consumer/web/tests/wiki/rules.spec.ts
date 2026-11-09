import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseRules, sectionName } from '~/features/wiki/rules'

const main = [
  '# Hikarinagi 收录与编目规则',
  '第 22 版。2026 年 11 月 4 日发布，自发布之日起实施。',
  '## 1　收录范围',
  '1.1　游戏只收录 galgame，依 A.2.1 判定。',
  '1.2　轻小说收录：',
  'a）出版社归为ライトノベル的；',
].join('\n\n')
const appendix = [
  '# 附录 A（规范性）　记录细则',
  '本附录规定各字段的记录方法。',
  '## A.2　来源',
  '### A.2.1　一手来源的分级',
  'A.2.1.1　一手来源分为两级，见 1.1，不是 2026.11。',
].join('\n\n')

describe('parseRules', () => {
  const book = parseRules([main, appendix], markdown => markdown)

  it('reads the edition, the sections and the clauses with what follows them', () => {
    expect(book.title).toBe('Hikarinagi 收录与编目规则')
    expect(book.edition).toBe('第 22 版。2026 年 11 月 4 日发布，自发布之日起实施。')
    expect(book.sections.map(item => [item.id, item.title, item.level])).toEqual([
      ['1', '收录范围', 2],
      ['附录 A（规范性）', '记录细则', 2],
      ['A.2', '来源', 2],
      ['A.2.1', '一手来源的分级', 3],
    ])
    expect(book.sections[1]?.intro).toBe('本附录规定各字段的记录方法。\n\n')
    expect(book.clauses.map(item => item.id)).toEqual(['1.1', '1.2', 'A.2.1.1'])
    expect(book.clauses[1]?.text).toContain('a）出版社归为ライトノベル的；')
  })

  it('reads every clause of the published rules', () => {
    const read = (name: string) =>
      readFileSync(
        join(process.cwd(), '../../../services/api/src/modules/wiki/rules', name),
        'utf8',
      )
    const rules = parseRules([read('main.md'), read('appendix.md')], markdown => markdown)
    expect(rules.edition).toMatch(/^第 \d+ 版/)
    const ids = new Set(rules.clauses.map(item => item.id))
    expect(ids.size).toBe(rules.clauses.length)
    for (const id of ['1.1', '6.3', 'A.2.1.6', 'A.6.6.1', 'A.13.8']) expect(ids.has(id)).toBe(true)
  })

  it('names a section without a number once', () => {
    const sections = parseRules(
      ['# 规则\n\n## 前言\n\n本规则规定收录。', '## 1　收录范围'],
      markdown => markdown,
    ).sections
    expect(sections.map(sectionName)).toEqual(['前言', '1　收录范围'])
  })

  it('links the clauses a clause cites and leaves other numbers alone', () => {
    expect(book.clauses[2]?.html).toBe(
      '**A.2.1.1**　一手来源分为两级，见 [1.1](/create/wiki/rules/1.1)，不是 2026.11。',
    )
  })
})
