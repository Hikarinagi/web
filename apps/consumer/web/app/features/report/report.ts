import type { components } from '@hikarinagi/api-contract/v3'

export type ReportBody = components['schemas']['ReportDto']
export type ReportReason = ReportBody['reason']

const REPORT_REASON_LABELS = {
  SPAM: '垃圾广告',
  INAPPROPRIATE: '不当内容',
  HARASSMENT: '骚扰攻击',
  VIOLENCE: '暴力威胁',
  SCAM: '诈骗误导',
  DISCRIMINATION: '歧视仇恨',
  OTHER: '其他',
} satisfies Record<ReportReason, string>

export const REPORT_REASON_VALUES = Object.keys(REPORT_REASON_LABELS) as [
  ReportReason,
  ...ReportReason[],
]

export const REPORT_REASON_OPTIONS = REPORT_REASON_VALUES.map(value => ({
  label: REPORT_REASON_LABELS[value],
  value,
}))

export function toReportBody(values: {
  reason: ReportReason
  description?: string | null
}): ReportBody {
  const description = values.description?.trim() ?? ''
  return {
    reason: values.reason,
    ...(description ? { description } : {}),
  }
}
