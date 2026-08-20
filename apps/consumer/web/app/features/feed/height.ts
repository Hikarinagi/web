import type { BackendFeedItem, FeedCluster, FeedRow } from './feed'
import { finishHours, statusVerb } from './feed'

interface HeightContext {
  rowWidth: number
  viewportWidth: number
  browserMeasure?: boolean
}

const SPACING = 4
const ITEM_PADDING_Y = 4.5 * SPACING * 2
const ITEM_PADDING_X = 2 * SPACING * 2
const ITEM_GAP_X = 3 * SPACING
const AVATAR_SIZE = 10 * SPACING
const CONTENT_GAP = 2 * SPACING
const STACK_GAP = 3 * SPACING
const HEADER_TWO_ROW = 42
const HEADER_COMPACT = 20
const HEADER_SINGLE_ROW = 24
const ACTION_BAR = 32
const HOT_COMMENT = 32
const WORK_REF_CARD = 94
const GROUP_COVER_HEIGHT = 64
const POST_SINGLE_COVER = 72 * SPACING
const POST_MULTI_COVER = 40 * SPACING
const POST_MULTI_MAX_WIDTH = 280
const POST_COVER_GAP = 2 * SPACING
const TOPIC_ICON = 14
const TOPIC_ICON_GAP = 2
const TOPIC_GAP_X = 2 * SPACING
const TOPIC_GAP_Y = SPACING

let canvasContext: CanvasRenderingContext2D | null | undefined
let fontFamilyCache: string | null = null
const textWidthCache = new Map<string, number>()

const BODY_TEXT = { font: font(15), lineHeight: 24.375 }
const BODY_TEXT_NORMAL = { font: font(15), lineHeight: 22.5 }
const TITLE_TEXT = { font: font(16, 600), lineHeight: 22 }
const TOPIC_TEXT = { font: font(14), lineHeight: 20 }

export function feedKey(item: BackendFeedItem) {
  return `${item.type}:${item.id}`
}

export function feedClusterHeight(cluster: FeedCluster, ctx: HeightContext) {
  let sum = 0
  cluster.rows.forEach((row, i) => {
    sum += entryHeight(row, ctx, i > 0)
  })
  return Math.ceil(Math.max(AVATAR_SIZE + ITEM_PADDING_Y, sum))
}

function entryHeight(row: FeedRow, ctx: HeightContext, hideName: boolean) {
  const content =
    row.kind === 'group' ? groupContentHeight() : itemContentHeight(row.item, ctx, hideName)
  return ITEM_PADDING_Y + content
}

function itemContentHeight(item: BackendFeedItem, ctx: HeightContext, hideName: boolean) {
  const width = contentWidth(ctx.rowWidth)
  const body = bodyHeight(item, width, ctx.browserMeasure === true)
  const header = hideName ? HEADER_COMPACT : HEADER_TWO_ROW
  const hotComment = 'hot_comment' in item && item.hot_comment ? CONTENT_GAP + HOT_COMMENT : 0
  return header + CONTENT_GAP + body + CONTENT_GAP + ACTION_BAR + hotComment
}

function groupContentHeight() {
  return (
    HEADER_SINGLE_ROW + CONTENT_GAP + BODY_TEXT_NORMAL.lineHeight + CONTENT_GAP + GROUP_COVER_HEIGHT
  )
}

export function resetFeedHeightCache() {
  textWidthCache.clear()
}

function contentWidth(rowWidth: number) {
  return Math.max(1, rowWidth - ITEM_PADDING_X - AVATAR_SIZE - ITEM_GAP_X)
}

function bodyHeight(item: BackendFeedItem, width: number, browserMeasure: boolean) {
  switch (item.type) {
    case 'post':
      return postHeight(item, width, browserMeasure)
    case 'article':
      return articleHeight(item, width, browserMeasure)
    case 'galgame_rate':
    case 'light_novel_rate':
    case 'manga_rate':
      return stack([
        WORK_REF_CARD,
        item.rate_content
          ? textHeight(item.rate_content, width, BODY_TEXT, true, browserMeasure)
          : 0,
      ])
    case 'galgame_status':
    case 'light_novel_status':
    case 'manga_status':
      return statusHeight(item, width, browserMeasure)
    case 'light_novel_volume_rate':
      return stack([
        textHeight(volumeRateText(item), width, BODY_TEXT_NORMAL, false, browserMeasure),
        WORK_REF_CARD,
        item.rate_content
          ? textHeight(item.rate_content, width, BODY_TEXT, true, browserMeasure)
          : 0,
      ])
  }
}

function postHeight(
  item: Extract<BackendFeedItem, { type: 'post' }>,
  width: number,
  browserMeasure: boolean,
) {
  return stack([
    item.excerpt ? textHeight(item.excerpt, width, BODY_TEXT, false, browserMeasure) : 0,
    coversHeight(item.covers, width),
  ])
}

function articleHeight(
  item: Extract<BackendFeedItem, { type: 'article' }>,
  width: number,
  browserMeasure: boolean,
) {
  const workCount = item.is_review && item.review_work ? 1 : item.work_refs.length

  return stack([
    textHeight(item.title, width, TITLE_TEXT, false, browserMeasure),
    workCount * WORK_REF_CARD + Math.max(0, workCount - 1) * STACK_GAP,
    item.excerpt ? textHeight(item.excerpt, width, BODY_TEXT, false, browserMeasure, 3) : 0,
    item.is_review && item.topics.length ? topicsHeight(item.topics, width, browserMeasure) : 0,
  ])
}

function statusHeight(
  item: Extract<
    BackendFeedItem,
    { type: 'galgame_status' | 'light_novel_status' | 'manga_status' }
  >,
  width: number,
  browserMeasure: boolean,
) {
  const iconWidth = 16 + 1.5 * SPACING
  const hours = 'time_to_finish_minutes' in item ? finishHours(item.time_to_finish_minutes) : null
  const timeLabel = item.type === 'galgame_status' ? '总游玩' : '总阅读'
  const text = `${statusVerb(item.type, item.status)} 《${item.work_ref.title}》${
    hours ? ` · ${timeLabel} ${hours}` : ''
  }`

  return textHeight(text, Math.max(1, width - iconWidth), BODY_TEXT_NORMAL, false, browserMeasure)
}

function volumeRateText(item: Extract<BackendFeedItem, { type: 'light_novel_volume_rate' }>) {
  const name =
    item.volume_ref.name_cn ||
    item.volume_ref.name ||
    `第 ${item.volume_ref.volume_number ?? '?'} 卷`

  return `读完《${name}》`
}

function coversHeight(
  covers: Array<{ width: number | null; height: number | null }>,
  containerWidth: number,
) {
  if (!covers.length) return 0
  if (covers.length === 1) return POST_SINGLE_COVER

  let rows = 1
  let used = 0
  for (const cover of covers) {
    const width = coverWidth(cover, containerWidth)
    if (used > 0 && used + POST_COVER_GAP + width > containerWidth) {
      rows += 1
      used = width
    } else {
      used += (used > 0 ? POST_COVER_GAP : 0) + width
    }
  }

  return rows * POST_MULTI_COVER + (rows - 1) * POST_COVER_GAP
}

function coverWidth(
  cover: { width: number | null; height: number | null },
  containerWidth: number,
) {
  const ratio = cover.width && cover.height ? cover.width / cover.height : 3 / 4
  return Math.min(containerWidth, POST_MULTI_MAX_WIDTH, POST_MULTI_COVER * ratio)
}

function topicsHeight(
  topics: Array<{ topic: { name: string } }>,
  containerWidth: number,
  browserMeasure: boolean,
) {
  let rows = 1
  let used = 0
  for (const rel of topics) {
    const width =
      TOPIC_ICON + TOPIC_ICON_GAP + measure(rel.topic.name, TOPIC_TEXT.font, browserMeasure)
    if (used > 0 && used + TOPIC_GAP_X + width > containerWidth) {
      rows += 1
      used = width
    } else {
      used += (used > 0 ? TOPIC_GAP_X : 0) + width
    }
  }

  return rows * TOPIC_TEXT.lineHeight + (rows - 1) * TOPIC_GAP_Y
}

function stack(parts: number[]) {
  const visible = parts.filter(part => part > 0)
  if (!visible.length) return 0

  return visible.reduce((sum, part) => sum + part, 0) + (visible.length - 1) * STACK_GAP
}

function textHeight(
  text: string,
  width: number,
  textStyle: { font: string; lineHeight: number },
  anywhere: boolean,
  browserMeasure: boolean,
  maxLines?: number,
) {
  const lines = lineCount(text, width, textStyle.font, anywhere, browserMeasure)
  return Math.ceil(Math.min(lines, maxLines ?? lines) * textStyle.lineHeight)
}

function lineCount(
  text: string,
  width: number,
  fontValue: string,
  anywhere: boolean,
  browserMeasure: boolean,
) {
  const normalized = text.replace(/\r\n?/g, '\n')
  const lines = normalized.split('\n')
  let count = 0

  for (const line of lines) {
    count += wrappedLineCount(line, width, fontValue, anywhere, browserMeasure)
  }

  return Math.max(1, count)
}

function wrappedLineCount(
  text: string,
  width: number,
  fontValue: string,
  anywhere: boolean,
  browserMeasure: boolean,
) {
  if (!text) return 1

  let lines = 1
  let used = 0
  for (const token of tokens(text, anywhere)) {
    const tokenWidth = measure(token, fontValue, browserMeasure)
    if (anywhere && tokenWidth > width && token.length > 1) {
      for (const char of Array.from(token)) {
        const charWidth = measure(char, fontValue, browserMeasure)
        if (used > 0 && used + charWidth > width) {
          lines += 1
          used = charWidth
        } else {
          used += charWidth
        }
      }
    } else if (used > 0 && used + tokenWidth > width) {
      lines += 1
      used = tokenWidth
    } else {
      used += tokenWidth
    }
  }

  return lines
}

function tokens(text: string, anywhere: boolean) {
  if (anywhere) return Array.from(text)

  return (
    text.match(
      /\s+|[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]|[^\s\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]+/gu,
    ) ?? []
  )
}

function measure(text: string, fontValue: string, browserMeasure: boolean) {
  if (!text) return 0

  const key = `${browserMeasure ? 'browser' : 'fallback'}\u0000${fontValue}\u0000${text}`
  const cached = textWidthCache.get(key)
  if (cached !== undefined) return cached

  const ctx = browserMeasure ? getCanvasContext() : null
  if (ctx) ctx.font = fontValue
  const width = ctx ? ctx.measureText(text).width : fallbackWidth(text, fontValue)
  if (textWidthCache.size > 10_000) textWidthCache.clear()
  textWidthCache.set(key, width)
  return width
}

function getCanvasContext() {
  if (canvasContext !== undefined) return canvasContext
  if (!import.meta.client) {
    canvasContext = null
    return canvasContext
  }

  canvasContext = document.createElement('canvas').getContext('2d')
  return canvasContext
}

function font(size: number, weight = 400) {
  return `${weight} ${size}px ${fontFamily()}`
}

function fontFamily() {
  if (fontFamilyCache) return fontFamilyCache
  if (import.meta.client && document.body) {
    fontFamilyCache = window.getComputedStyle(document.body).fontFamily
    return fontFamilyCache
  }

  return "'Noto Sans SC', 'Noto Sans', ui-sans-serif, system-ui, sans-serif"
}

function fallbackWidth(text: string, fontValue: string) {
  const size = Number(fontValue.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? 15)
  let width = 0
  for (const char of Array.from(text)) {
    if (/\s/u.test(char)) width += size * 0.32
    else if (/[a-z0-9]/iu.test(char)) width += size * 0.56
    else if (/[.,:;!?'"()[\]{}]/u.test(char)) width += size * 0.36
    else width += size
  }

  return width
}
