import { headingSlug, nodeText } from '~/utils/heading'

export interface TocEntry {
  id: string
  text: string
  level: number
}

type DocNode = {
  type?: string
  attrs?: Record<string, unknown> | null
  text?: string
  content?: DocNode[]
}

// 从文章 content_json 顶层抽 h2/h3 作为目录项(与 Heading.vue 同一套 slug)。
export function extractToc(doc: { content?: readonly unknown[] } | null | undefined): TocEntry[] {
  const out: TocEntry[] = []
  for (const raw of doc?.content ?? []) {
    const node = raw as DocNode
    if (node.type !== 'heading') continue
    const level = Number(node.attrs?.level) || 2
    if (level !== 2 && level !== 3) continue
    const text = nodeText(node).trim()
    if (!text) continue
    out.push({ id: headingSlug(text), text, level })
  }
  return out
}
