import type { components } from '@hikarinagi/api-contract/v3'

export type EpubReportBody = components['schemas']['EpubReportDto']
export type EpubReportReason = EpubReportBody['reason']

type ReportableReason = Exclude<EpubReportReason, 'MISSING'>

const EPUB_REPORT_REASON_LABELS = {
  WRONG_VOLUME: '卷号 / 卷名错误',
  BUNDLE: '是合集打包,非单卷',
  JAPANESE_ORIGINAL: '日文原版,非中文翻译',
  MACHINE_TRANSLATION: '机翻',
  CORRUPT: '文件损坏 / 无法阅读',
  OTHER: '我有更好的版本 / 其他',
} satisfies Record<ReportableReason, string>

export const EPUB_REPORT_REASON_VALUES = Object.keys(EPUB_REPORT_REASON_LABELS) as [
  ReportableReason,
  ...ReportableReason[],
]

export const EPUB_REPORT_REASON_OPTIONS = EPUB_REPORT_REASON_VALUES.map(value => ({
  label: EPUB_REPORT_REASON_LABELS[value],
  value,
}))

export function toEpubReportBody(values: {
  reason: EpubReportReason
  description?: string | null
}): EpubReportBody {
  const description = values.description?.trim() ?? ''
  return {
    reason: values.reason,
    ...(description ? { description } : {}),
  }
}
