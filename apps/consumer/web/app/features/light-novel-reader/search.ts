import type { SearchResult } from '@ritojs/kit'
import { rowAt, type TocRow } from './toc'

const REACH = 14
const CJK = '\\p{sc=Han}\\p{sc=Hira}\\p{sc=Kana}\\u3000-\\u303f\\uff00-\\uffef'
const AROUND_CJK = new RegExp(`(?<=[${CJK}])\\s+|\\s+(?=[${CJK}])`, 'gu')

export function snippet(context: string, term: string) {
  const text = context.replace(AROUND_CJK, '').replace(/\s+/g, ' ').trim()
  const at = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1
  if (at < 0) return { before: '', match: '', after: text }
  const start = Math.max(0, at - REACH)
  const end = Math.min(text.length, at + term.length + REACH)
  return {
    before: `${start > 0 ? '…' : ''}${text.slice(start, at)}`,
    match: text.slice(at, at + term.length),
    after: `${text.slice(at + term.length, end)}${end < text.length ? '…' : ''}`,
  }
}

export function groupResults(results: readonly SearchResult[], rows: readonly TocRow[]) {
  const groups: { key: string; label: string; hits: { index: number; result: SearchResult }[] }[] =
    []
  results.forEach((result, index) => {
    const row = rowAt(rows, result.pageIndex)
    const key = row?.key ?? ''
    const last = groups.at(-1)
    if (last?.key === key) last.hits.push({ index, result })
    else groups.push({ key, label: row?.label ?? '', hits: [{ index, result }] })
  })
  return groups
}
