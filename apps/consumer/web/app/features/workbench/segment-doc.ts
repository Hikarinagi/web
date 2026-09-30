import { parseNovelMarkup, serializeNovelMarkup, type NovelInlineRun } from '@hikarinagi/shared'

export interface DocNode {
  type: string
  attrs?: Record<string, unknown>
  text?: string
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: DocNode[]
}

export interface SegmentSource {
  id: string
  kind: 'TEXT' | 'IMAGE' | 'BREAK'
  text: string | null
  caption: string | null
  image: { id: number; src: string; width: number | null; height: number | null } | null
}

export interface ChapterBlock {
  id: string
  kind: 'TEXT' | 'IMAGE' | 'BREAK'
  text: string | null
  image_id: number | null
  caption: string | null
}

export interface SavedSegment extends ChapterBlock {
  sort_key: number
  version: number
}

function textToInline(text: string): DocNode[] {
  const nodes: DocNode[] = []
  text.split('\n').forEach((line, index) => {
    if (index > 0) nodes.push({ type: 'hard_break' })
    for (const run of parseNovelMarkup(line)) {
      if (run.kind === 'ruby') {
        nodes.push({
          type: 'text',
          text: run.base,
          marks: [{ type: 'ruby', attrs: { reading: run.ruby } }],
        })
      } else if (run.kind === 'emphasis') {
        nodes.push({ type: 'text', text: run.text, marks: [{ type: 'emphasis' }] })
      } else if (run.kind === 'text' && run.text) {
        nodes.push({ type: 'text', text: run.text })
      }
    }
  })
  return nodes
}

function inlineToText(nodes: DocNode[] = []): string {
  const runs: NovelInlineRun[] = []
  for (const node of nodes) {
    if (node.type === 'hard_break') {
      runs.push({ kind: 'text', text: '\n' })
      continue
    }
    if (node.type !== 'text' || !node.text) continue
    const reading = node.marks?.find(mark => mark.type === 'ruby')?.attrs?.reading
    if (typeof reading === 'string' && reading) {
      runs.push({ kind: 'ruby', base: node.text, ruby: reading })
    } else if (node.marks?.some(mark => mark.type === 'emphasis')) {
      runs.push({ kind: 'emphasis', text: node.text })
    } else {
      runs.push({ kind: 'text', text: node.text })
    }
  }
  return serializeNovelMarkup(runs)
}

export function segmentsToDoc(segments: readonly SegmentSource[]): DocNode {
  const content = segments.map((segment): DocNode => {
    if (segment.kind === 'IMAGE' && segment.image) {
      return {
        type: 'image_block',
        attrs: {
          segment_id: segment.id,
          media_asset_id: segment.image.id,
          src: segment.image.src,
          alt: null,
          caption: segment.caption,
          width: segment.image.width ?? 0,
          height: segment.image.height ?? 0,
          width_percent: 100,
        },
      }
    }
    if (segment.kind === 'BREAK')
      return { type: 'horizontal_rule', attrs: { segment_id: segment.id } }
    const inline = textToInline(segment.text ?? '')
    return {
      type: 'paragraph',
      attrs: { segment_id: segment.id },
      ...(inline.length ? { content: inline } : {}),
    }
  })
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] }
}

export function docToBlocks(doc: DocNode): ChapterBlock[] {
  const blocks: ChapterBlock[] = []
  for (const node of doc.content ?? []) {
    const id = node.attrs?.segment_id
    if (typeof id !== 'string' || !id) continue
    if (node.type === 'paragraph') {
      const text = inlineToText(node.content)
      if (text.trim()) blocks.push({ id, kind: 'TEXT', text, image_id: null, caption: null })
    } else if (node.type === 'image_block') {
      const imageId = Number(node.attrs?.media_asset_id)
      const caption = typeof node.attrs?.caption === 'string' ? node.attrs.caption.trim() : ''
      if (imageId > 0)
        blocks.push({ id, kind: 'IMAGE', text: null, image_id: imageId, caption: caption || null })
    } else if (node.type === 'horizontal_rule') {
      blocks.push({ id, kind: 'BREAK', text: null, image_id: null, caption: null })
    }
  }
  return blocks
}

export function diffBlocks(
  blocks: readonly ChapterBlock[],
  saved: ReadonlyMap<string, SavedSegment>,
) {
  const upserts: (ChapterBlock & { sort_key: number; base_version?: number })[] = []
  let previous = 0
  blocks.forEach((block, index) => {
    const existing = saved.get(block.id)
    let upper: number | undefined
    for (const later of blocks.slice(index + 1)) {
      const key = saved.get(later.id)?.sort_key
      if (key !== undefined && key > previous) {
        upper = key
        break
      }
    }
    const keep =
      existing && existing.sort_key > previous && (upper === undefined || existing.sort_key < upper)
    const sortKey = keep
      ? existing.sort_key
      : upper !== undefined
        ? (previous + upper) / 2
        : previous + 1024
    previous = sortKey
    const changed =
      !existing ||
      existing.sort_key !== sortKey ||
      existing.kind !== block.kind ||
      existing.text !== block.text ||
      existing.image_id !== block.image_id ||
      existing.caption !== block.caption
    if (changed) {
      upserts.push({
        ...block,
        sort_key: sortKey,
        ...(existing ? { base_version: existing.version } : {}),
      })
    }
  })
  const present = new Set(blocks.map(block => block.id))
  const deletes = [...saved.values()]
    .filter(segment => !present.has(segment.id))
    .map(segment => ({ id: segment.id, base_version: segment.version }))
  return { upserts, deletes }
}
