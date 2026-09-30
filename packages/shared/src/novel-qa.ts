import { novelTagText, parseNovelMarkup, stripNovelMarkup } from './novel-markup'

export interface NovelQaTerm {
  source: string
  target: string
  forbidden: boolean
}

export interface NovelQaIssue {
  level: 'error' | 'warning'
  code:
    | 'empty'
    | 'forbidden_term'
    | 'line_count'
    | 'tag_mismatch'
    | 'term_missing'
    | 'halfwidth_punctuation'
    | 'inconsistent'
  message: string
}

const HALFWIDTH_NEAR_HAN = /[\p{Script=Han}][,.?!:;]|[,.?!:;][\p{Script=Han}]/u

function tagIssues(source: string, target: string): NovelQaIssue[] {
  const tagsOf = (text: string) =>
    parseNovelMarkup(text, { tags: true }).flatMap(run => (run.kind === 'tag' ? [run] : []))
  const expected = tagsOf(source).map(novelTagText)
  const actual = tagsOf(target)
  const left = [...expected]
  const extra: string[] = []
  for (const run of actual) {
    const at = left.indexOf(novelTagText(run))
    if (at >= 0) left.splice(at, 1)
    else extra.push(novelTagText(run))
  }
  const issues: NovelQaIssue[] = [
    ...left.map(tag => ({
      level: 'error' as const,
      code: 'tag_mismatch' as const,
      message: `缺少标记：${tag}`,
    })),
    ...extra.map(tag => ({
      level: 'error' as const,
      code: 'tag_mismatch' as const,
      message: `标记不在原文中：${tag}`,
    })),
  ]
  if (issues.length) return issues
  const open: number[] = []
  const nested = actual.every(run => {
    if (run.role === 'open') open.push(run.id)
    return run.role !== 'close' || open.pop() === run.id
  })
  return nested && !open.length
    ? []
    : [{ level: 'error', code: 'tag_mismatch', message: '标记未正确配对或嵌套' }]
}

export function checkNovelTranslation(input: {
  source: string
  target: string
  targetLang: string
  terms: readonly NovelQaTerm[]
  tags?: boolean
}): NovelQaIssue[] {
  const issues: NovelQaIssue[] = []
  const options = { tags: input.tags }
  const source = stripNovelMarkup(input.source, options)
  const target = stripNovelMarkup(input.target, options)
  if (!target.trim()) {
    issues.push({ level: 'error', code: 'empty', message: '译文为空' })
    return issues
  }
  if (source.split('\n').length !== target.split('\n').length) {
    issues.push({ level: 'error', code: 'line_count', message: '换行数与原文不一致' })
  }
  if (input.tags) issues.push(...tagIssues(input.source, input.target))
  for (const term of input.terms) {
    if (!term.source || !source.includes(term.source)) continue
    if (term.forbidden) {
      if (term.target && target.includes(term.target)) {
        issues.push({
          level: 'error',
          code: 'forbidden_term',
          message: `「${term.source}」不能译为「${term.target}」`,
        })
      }
      continue
    }
    if (term.target && !target.includes(term.target)) {
      issues.push({
        level: 'warning',
        code: 'term_missing',
        message: `术语「${term.source}」按术语表应译为「${term.target}」`,
      })
    }
  }
  const loose = input.tags
    ? stripNovelMarkup(input.target.replace(/\{(\d+)\}[\s\S]*?\{\/\1\}/g, ''), options)
    : target
  if (input.targetLang.startsWith('zh') && HALFWIDTH_NEAR_HAN.test(loose)) {
    issues.push({
      level: 'warning',
      code: 'halfwidth_punctuation',
      message: '中文译文中含有半角标点',
    })
  }
  return issues
}
