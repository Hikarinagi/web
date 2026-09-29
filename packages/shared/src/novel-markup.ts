export type NovelInlineRun =
  | { kind: 'text'; text: string }
  | { kind: 'ruby'; base: string; ruby: string }
  | { kind: 'emphasis'; text: string }

const MARKUP_PATTERN = /｜([^｜《》\n]{1,50})《([^《》\n]{1,50})》|《《([^《》\n]{1,100})》》/g

export function parseNovelMarkup(text: string): NovelInlineRun[] {
  const runs: NovelInlineRun[] = []
  let last = 0
  for (const match of text.matchAll(MARKUP_PATTERN)) {
    const at = match.index ?? 0
    if (at > last) runs.push({ kind: 'text', text: text.slice(last, at) })
    if (match[1] !== undefined) runs.push({ kind: 'ruby', base: match[1], ruby: match[2] })
    else runs.push({ kind: 'emphasis', text: match[3] })
    last = at + match[0].length
  }
  if (last < text.length) runs.push({ kind: 'text', text: text.slice(last) })
  return runs
}

export function serializeNovelMarkup(runs: readonly NovelInlineRun[]): string {
  return runs
    .map(run =>
      run.kind === 'text'
        ? run.text
        : run.kind === 'ruby'
          ? `｜${run.base}《${run.ruby}》`
          : `《《${run.text}》》`,
    )
    .join('')
}

export function stripNovelRuby(text: string): string {
  return serializeNovelMarkup(
    parseNovelMarkup(text).map(run =>
      run.kind === 'ruby' ? { kind: 'text', text: run.base } : run,
    ),
  )
}

export function stripNovelMarkup(text: string): string {
  return parseNovelMarkup(text)
    .map(run => (run.kind === 'ruby' ? run.base : run.text))
    .join('')
}
