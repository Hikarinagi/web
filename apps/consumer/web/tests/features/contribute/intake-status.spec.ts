import { intakeStatus, reviewStatus } from '~/features/contribute/intake-status'
import type { IntakeItem } from '~/features/contribute/useNovelIntake'

const item = (overrides: Partial<IntakeItem> = {}): IntakeItem => ({
  key: 'epub-1',
  file: new File(['x'], 'a.epub'),
  stage: 'ready',
  verdict: 'missing',
  volume: null,
  suggestion: null,
  review: null,
  error: null,
  ...overrides,
})

it('处理中的阶段不盖章，只显示进度', () => {
  expect(intakeStatus(item({ stage: 'identifying', verdict: null }), false)).toMatchObject({
    label: '识别中',
    busy: true,
  })
  expect(intakeStatus(item({ stage: 'uploading' }), false)).toMatchObject({ busy: true })
})

it('提交之后以校验状态为准，重复标记不参与判断', () => {
  const review = { id: 1, reasons: [], created_at: '2026-09-24T00:00:00Z' }
  expect(
    intakeStatus(item({ stage: 'submitted', review: { ...review, status: 'PENDING' } }), true),
  ).toMatchObject({ label: '校验中', busy: true })
  expect(reviewStatus('PASSED')).toMatchObject({ ink: 'red', label: '已上架' })
  expect(reviewStatus('REJECTED')).toMatchObject({ ink: 'ink', label: '未通过' })
  expect(reviewStatus('NEEDS_HUMAN')).toMatchObject({ ink: 'blue', label: '人工复核' })
})

it('识别结果对应各自的印章，同卷重复优先于待提交', () => {
  expect(intakeStatus(item(), false)).toMatchObject({ ink: 'red', label: '待提交' })
  expect(intakeStatus(item(), true)).toMatchObject({ ink: 'ink', label: '重复' })
  expect(intakeStatus(item({ verdict: 'unknown' }), false)).toMatchObject({
    ink: 'blue',
    label: '待确认',
  })
  expect(intakeStatus(item({ verdict: 'present' }), false).label).toBe('已收录')
  expect(intakeStatus(item({ verdict: 'bundle' }), false).label).toBe('合集')
  expect(intakeStatus(item({ verdict: 'unreadable' }), false).label).toBe('无法读取')
  expect(intakeStatus(item({ verdict: 'oversize' }), false).label).toBe('超出大小')
})
