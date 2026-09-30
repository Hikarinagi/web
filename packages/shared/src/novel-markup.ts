export type NovelInlineRun =
  | { kind: 'text'; text: string }
  | { kind: 'ruby'; base: string; ruby: string }
  | { kind: 'emphasis'; text: string }
  | { kind: 'tag'; id: number; role: 'open' | 'close' | 'self' }

export interface NovelMarkupOptions {
  tags?: boolean
}

const MARKUP_PATTERN = /｜([^｜《》\n]{1,50})《([^《》\n]{1,50})》|《《([^《》\n]{1,100})》》/g
const TAGGED_PATTERN =
  /｜([^｜《》\n]{1,50})《([^《》\n]{1,50})》|《《([^《》\n]{1,100})》》|\{(\/?)([1-9]\d{0,2})(\/?)\}/g

export function parseNovelMarkup(text: string, options: NovelMarkupOptions = {}): NovelInlineRun[] {
  const runs: NovelInlineRun[] = []
  const push = (value: string) => {
    if (!value) return
    const last = runs[runs.length - 1]
    if (last?.kind === 'text') last.text += value
    else runs.push({ kind: 'text', text: value })
  }
  let last = 0
  for (const match of text.matchAll(options.tags ? TAGGED_PATTERN : MARKUP_PATTERN)) {
    const at = match.index ?? 0
    push(text.slice(last, at))
    last = at + match[0].length
    if (match[1] !== undefined) runs.push({ kind: 'ruby', base: match[1], ruby: match[2] })
    else if (match[3] !== undefined) runs.push({ kind: 'emphasis', text: match[3] })
    else if (match[4] && match[6]) push(match[0])
    else {
      const role = match[4] ? 'close' : match[6] ? 'self' : 'open'
      runs.push({ kind: 'tag', id: Number(match[5]), role })
    }
  }
  push(text.slice(last))
  return runs
}

export function novelTagText(run: { id: number; role: 'open' | 'close' | 'self' }): string {
  return run.role === 'open'
    ? `{${run.id}}`
    : run.role === 'close'
      ? `{/${run.id}}`
      : `{${run.id}/}`
}

export function serializeNovelMarkup(runs: readonly NovelInlineRun[]): string {
  return runs
    .map(run =>
      run.kind === 'text'
        ? run.text
        : run.kind === 'ruby'
          ? `｜${run.base}《${run.ruby}》`
          : run.kind === 'emphasis'
            ? `《《${run.text}》》`
            : novelTagText(run),
    )
    .join('')
}

export function stripNovelRuby(text: string, options: NovelMarkupOptions = {}): string {
  return serializeNovelMarkup(
    parseNovelMarkup(text, options).map(run =>
      run.kind === 'ruby' ? { kind: 'text', text: run.base } : run,
    ),
  )
}

export function stripNovelTags(text: string): string {
  return serializeNovelMarkup(
    parseNovelMarkup(text, { tags: true }).filter(run => run.kind !== 'tag'),
  )
}

export function stripNovelMarkup(text: string, options: NovelMarkupOptions = {}): string {
  return parseNovelMarkup(text, options)
    .map(run => (run.kind === 'ruby' ? run.base : run.kind === 'tag' ? '' : run.text))
    .join('')
}
