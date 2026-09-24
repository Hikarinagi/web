import type { EpubReviewStatus } from '~/features/light-novel-volume/epub-correction'
import type { IntakeItem } from './useNovelIntake'

export interface IntakeStatus {
  ink: 'red' | 'blue' | 'ink'
  label: string
  busy?: boolean
  hint?: string
}

export const REVIEW_TAG_TONE: Record<
  EpubReviewStatus,
  'neutral' | 'success' | 'info' | 'warning' | 'danger'
> = {
  PENDING: 'neutral',
  RUNNING: 'neutral',
  PASSED: 'success',
  NEEDS_HUMAN: 'info',
  REJECTED: 'warning',
  FAILED: 'danger',
}

export function reviewStatus(status: EpubReviewStatus): IntakeStatus {
  switch (status) {
    case 'PASSED':
      return { ink: 'red', label: '已上架' }
    case 'NEEDS_HUMAN':
      return { ink: 'blue', label: '人工复核', hint: '已转交人工复核，通过后自动上架。' }
    case 'REJECTED':
      return { ink: 'ink', label: '未通过' }
    case 'FAILED':
      return { ink: 'ink', label: '校验失败', hint: '校验过程出错，请重新上传。' }
    default:
      return { ink: 'ink', label: '校验中', busy: true }
  }
}

export function intakeStatus(item: IntakeItem, duplicate: boolean): IntakeStatus {
  if (item.stage === 'reading') return { ink: 'ink', label: '读取中', busy: true }
  if (item.stage === 'identifying') return { ink: 'ink', label: '识别中', busy: true }
  if (item.stage === 'uploading') return { ink: 'ink', label: '上传中', busy: true }
  if (item.stage === 'failed') return { ink: 'ink', label: '上传失败' }
  if (item.review) return reviewStatus(item.review.status)
  if (duplicate) {
    return { ink: 'ink', label: '重复', hint: '与另一文件对应同一卷，仅提交先加入的文件。' }
  }
  switch (item.verdict) {
    case 'missing':
      return { ink: 'red', label: '待提交' }
    case 'present':
      return { ink: 'ink', label: '已收录', hint: '本站已收录此卷，该文件不会提交。' }
    case 'bundle':
      return { ink: 'ink', label: '合集', hint: '多卷合集，请拆分为单卷后提交。' }
    case 'unreadable':
      return { ink: 'ink', label: '无法读取', hint: '文件无法解析，可能不是 EPUB 或已损坏。' }
    case 'oversize':
      return { ink: 'ink', label: '超出大小', hint: '文件大小超出上传上限。' }
    default:
      return { ink: 'blue', label: '待确认' }
  }
}
