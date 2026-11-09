import { formatBytes } from '~/features/download/format'
import type { BackendMangaCheck } from '../manga'

type Result = NonNullable<BackendMangaCheck['result']>
type Flag = Result['pages'][number]['flags'][number]

export type CheckTone = 'success' | 'warning' | 'neutral'

export interface CheckItem {
  key: string
  label: string
  text: string
  tone: CheckTone
  pages: number[]
}

export const FLAG_LABEL: Record<Flag, string> = {
  duplicate: '重复',
  blank: '可能空白',
  size: '尺寸',
}

export function sizeOf(bytes: number | null): string {
  return bytes === null ? '未知' : formatBytes(bytes)
}

export function pageList(numbers: number[]): string {
  if (!numbers.length) return '无'
  const sorted = [...numbers].sort((a, b) => a - b)
  return sorted.length > 6
    ? `第 ${sorted.slice(0, 6).join('、')} 页等 ${sorted.length} 页`
    : `第 ${sorted.join('、')} 页`
}

export function checkItems(result: Result, numberOf: (pageId: number) => number): CheckItem[] {
  const { summary } = result
  const baseline = summary.baseline_page_count !== null
  const flagged = (flag: Flag) =>
    result.pages.filter(page => page.flags.includes(flag)).map(page => page.page_id)
  const listed = (flag: Flag, key: string, label: string): CheckItem => {
    const pages = flagged(flag)
    return {
      key,
      label,
      text: pageList(pages.map(numberOf)),
      tone: pages.length ? 'warning' : 'success',
      pages,
    }
  }
  const items: CheckItem[] = [
    {
      key: 'count',
      label: '页数',
      text: `${summary.page_count} 页${baseline ? `；现有版本 ${summary.baseline_page_count} 页` : ''}`,
      tone: 'neutral',
      pages: [],
    },
    {
      key: 'resolution',
      label: '分辨率',
      text: `${summary.width} × ${summary.height}${
        baseline && summary.baseline_width !== null
          ? `；现有版本 ${summary.baseline_width} × ${summary.baseline_height}`
          : ''
      }`,
      tone:
        summary.baseline_width !== null && summary.width < summary.baseline_width
          ? 'warning'
          : 'success',
      pages: [],
    },
    {
      key: 'bytes',
      label: '文件大小',
      text: `平均 ${sizeOf(summary.average_bytes)}${
        baseline ? `；现有版本 ${sizeOf(summary.baseline_average_bytes)}` : ''
      }`,
      tone:
        summary.average_bytes !== null &&
        summary.baseline_average_bytes !== null &&
        summary.average_bytes < summary.baseline_average_bytes
          ? 'warning'
          : 'success',
      pages: [],
    },
  ]
  if (baseline && result.baseline) {
    const extra = result.pages.filter(page => page.match === null).map(page => page.page_id)
    const used = new Set(result.pages.map(page => page.match))
    const missing = result.baseline
      .map((_, index) => index)
      .filter(index => !used.has(index))
      .map(index => index + 1)
    const parts = [`${summary.matched ?? 0} 页一一对应`]
    if (extra.length) parts.push(`新上传多出${pageList(extra.map(numberOf))}`)
    if (missing.length) parts.push(`新上传缺少现有版本${pageList(missing)}`)
    items.push({
      key: 'match',
      label: '页面对应',
      text: parts.join('；'),
      tone: extra.length || missing.length ? 'warning' : 'success',
      pages: extra,
    })
  }
  items.push(
    listed('duplicate', 'duplicate', '疑似重复'),
    listed('blank', 'blank', '可能空白'),
    listed('size', 'size', '尺寸异常'),
  )
  return items
}
