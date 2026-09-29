import { stripNovelMarkup } from './novel-markup'

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
    | 'term_missing'
    | 'halfwidth_punctuation'
    | 'inconsistent'
  message: string
}

const HALFWIDTH_NEAR_HAN = /[\p{Script=Han}][,.?!:;]|[,.?!:;][\p{Script=Han}]/u

export function checkNovelTranslation(input: {
  source: string
  target: string
  targetLang: string
  terms: readonly NovelQaTerm[]
}): NovelQaIssue[] {
  const issues: NovelQaIssue[] = []
  const source = stripNovelMarkup(input.source)
  const target = stripNovelMarkup(input.target)
  if (!target.trim()) {
    issues.push({ level: 'error', code: 'empty', message: '译文为空' })
    return issues
  }
  if (source.split('\n').length !== target.split('\n').length) {
    issues.push({ level: 'error', code: 'line_count', message: '换行数与原文不一致' })
  }
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
  if (input.targetLang.startsWith('zh') && HALFWIDTH_NEAR_HAN.test(target)) {
    issues.push({
      level: 'warning',
      code: 'halfwidth_punctuation',
      message: '中文译文中含有半角标点',
    })
  }
  return issues
}
