export interface DiffLine {
  type: 'equal' | 'add' | 'remove'
  text: string
}

export function diffLines(from: string, to: string): DiffLine[] {
  const a = from.split('\n')
  const b = to.split('\n')
  const m = a.length
  const n = b.length
  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i]![j] =
        a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!)
    }
  }

  const lines: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      lines.push({ type: 'equal', text: a[i]! })
      i++
      j++
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      lines.push({ type: 'remove', text: a[i]! })
      i++
    } else {
      lines.push({ type: 'add', text: b[j]! })
      j++
    }
  }
  while (i < m) lines.push({ type: 'remove', text: a[i++]! })
  while (j < n) lines.push({ type: 'add', text: b[j++]! })
  return lines
}
