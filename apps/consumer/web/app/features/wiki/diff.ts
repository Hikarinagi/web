import { diffLines } from 'diff'

export type DiffLine =
  { kind: 'same' | 'removed' | 'added'; text: string } | { kind: 'gap'; count: number }

export function lineDiff(before: string, after: string): DiffLine[] {
  const lines = diffLines(before.replace(/\r\n?/g, '\n'), after.replace(/\r\n?/g, '\n')).flatMap(
    change => {
      const kind = change.added ? 'added' : change.removed ? 'removed' : 'same'
      return change.value
        .replace(/\n$/, '')
        .split('\n')
        .map(text => ({ kind, text }) as const)
    },
  )
  const result: DiffLine[] = []
  let hidden = 0
  lines.forEach((line, index) => {
    const near = lines.slice(Math.max(0, index - 1), index + 2).some(item => item.kind !== 'same')
    if (!near) {
      hidden++
      return
    }
    if (hidden) result.push({ kind: 'gap', count: hidden })
    hidden = 0
    result.push(line)
  })
  if (hidden) result.push({ kind: 'gap', count: hidden })
  return result
}
