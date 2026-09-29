export interface TypesetStyle {
  vertical: boolean
  font: 'sans' | 'serif'
  size: number | null
  color: 'black' | 'white'
  stroke: boolean
  fill: boolean
}

export interface Glyph {
  text: string
  x: number
  y: number
}

export const TYPESET_FONTS = {
  sans: { family: '"Noto Sans SC", sans-serif', weight: 700 },
  serif: { family: '"Noto Serif SC", serif', weight: 700 },
} as const

export const VERTICAL_FORMS: Record<string, string> = {
  '（': '︵',
  '）': '︶',
  '(': '︵',
  ')': '︶',
  '「': '﹁',
  '」': '﹂',
  '『': '﹃',
  '』': '﹄',
  '【': '︻',
  '】': '︼',
  '《': '︽',
  '》': '︾',
  '〈': '︿',
  '〉': '﹀',
  '“': '﹁',
  '”': '﹂',
  '‘': '﹃',
  '’': '﹄',
  '…': '︙',
  '⋯': '︙',
  '—': '︱',
  '─': '︱',
  ー: '丨',
  '～': '≀',
  '〜': '≀',
  '、': '︑',
  '。': '︒',
  '，': '︐',
  '！': '︕',
  '？': '︖',
  '：': '︓',
  '；': '︔',
}

export function readStyle(style: unknown, vertical: boolean): TypesetStyle {
  const value = (style && typeof style === 'object' ? style : {}) as Record<string, unknown>
  return {
    vertical: typeof value.vertical === 'boolean' ? value.vertical : vertical,
    font: value.font === 'serif' ? 'serif' : 'sans',
    size: typeof value.size === 'number' && value.size > 0 ? value.size : null,
    color: value.color === 'white' ? 'white' : 'black',
    stroke: value.stroke === true,
    fill: value.fill === true,
  }
}

export function layoutVertical(
  text: string,
  width: number,
  height: number,
  size: number,
): { fits: boolean; glyphs: Glyph[] } {
  const perColumn = Math.floor(height / size)
  if (perColumn < 1) return { fits: false, glyphs: [] }
  let current: string[] = []
  const columns: string[][] = [current]
  for (const char of Array.from(text.trim())) {
    if (char === '\n' || current.length >= perColumn) {
      current = []
      columns.push(current)
      if (char === '\n') continue
    }
    current.push(VERTICAL_FORMS[char] ?? char)
  }
  const used = columns.filter(column => column.length)
  const pitch = size * 1.2
  const blockWidth = used.length * pitch - (pitch - size)
  const longest = Math.max(0, ...used.map(column => column.length))
  const right = (width + blockWidth) / 2
  const top = (height - longest * size) / 2
  const glyphs = used.flatMap((column, index) =>
    column.map((char, row) => ({
      text: char,
      x: right - index * pitch - size / 2,
      y: top + row * size + size / 2,
    })),
  )
  return { fits: blockWidth <= width, glyphs }
}

export function layoutHorizontal(
  text: string,
  width: number,
  height: number,
  size: number,
  measure: (text: string, size: number) => number,
): { fits: boolean; glyphs: Glyph[] } {
  const tokens = text.trim().match(/\n|[A-Za-z0-9'’-]+\s*|\s+|./gsu) ?? []
  const lines: string[] = []
  let current = ''
  let overflow = false
  for (const token of tokens) {
    if (token === '\n') {
      lines.push(current)
      current = ''
      continue
    }
    if (current && measure(current + token.trimEnd(), size) > width) {
      lines.push(current)
      current = token.trimStart()
    } else {
      current += token
    }
    if (measure(current.trimEnd(), size) > width) overflow = true
  }
  lines.push(current)
  const pitch = size * 1.3
  const top = (height - lines.length * pitch) / 2
  return {
    fits: !overflow && lines.length * pitch <= height,
    glyphs: lines.map((line, index) => ({
      text: line.trim(),
      x: width / 2,
      y: top + index * pitch + pitch / 2,
    })),
  }
}

export function fitLayout(
  text: string,
  width: number,
  height: number,
  style: TypesetStyle,
  measure: (text: string, size: number) => number,
): { size: number; glyphs: Glyph[] } {
  const layout = (size: number) =>
    style.vertical
      ? layoutVertical(text, width, height, size)
      : layoutHorizontal(text, width, height, size, measure)
  if (style.size) return { size: style.size, glyphs: layout(style.size).glyphs }
  let low = 8
  let high = Math.max(low, Math.floor(Math.min(width, height)))
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if (layout(middle).fits) low = middle
    else high = middle - 1
  }
  return { size: low, glyphs: layout(low).glyphs }
}
