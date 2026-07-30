import { EDITOR_PRESENTATIONS } from '~/features/creator/editor/presentation'
import { RESOURCE_SLUG } from '~/features/creator/labels'
import type { RevisionSummaryWithDiff } from './resources'

type DiffOp = Record<string, unknown>

export interface RevisionDiffRow {
  action: string
  label: string
  summary: string
}

export interface RevisionDiffSummary {
  changeCount: number
  hiddenCount: number
  rows: RevisionDiffRow[]
}

const VISIBLE_CHANGE_LIMIT = 6

export function summarizeRevisionDiff(
  revision: Pick<RevisionSummaryWithDiff, 'diff' | 'resource_type'>,
  limit = VISIBLE_CHANGE_LIMIT,
): RevisionDiffSummary {
  const changes = toDiffOps(revision.diff?.changeset)
  const fields = fieldLabelsFor(revision.resource_type)
  const rows = changes.slice(0, limit).map(op => ({
    action: actionFor(op),
    label: labelFor(op, fields),
    summary: summaryFor(op),
  }))

  return {
    changeCount: changes.length,
    hiddenCount: Math.max(0, changes.length - rows.length),
    rows,
  }
}

function toDiffOps(value: unknown): DiffOp[] {
  if (!Array.isArray(value)) return []
  return value.filter((op): op is DiffOp => isRecord(op))
}

function fieldLabelsFor(resourceType: string) {
  const slug = RESOURCE_SLUG[resourceType]
  return (slug ? EDITOR_PRESENTATIONS[slug]?.fields : undefined) ?? {}
}

function actionFor(op: DiffOp) {
  const kind = String(op.kind)
  if (kind === 'relation_add') return '添加'
  if (kind === 'relation_remove') return '移除'
  if (kind === 'relation_update') return '更新'
  return '修改'
}

function labelFor(op: DiffOp, fields: ReturnType<typeof fieldLabelsFor>) {
  const key =
    typeof op.field === 'string' ? op.field : typeof op.relation === 'string' ? op.relation : ''
  if (!key) return '条目'
  return fields[key]?.label ?? key
}

function summaryFor(op: DiffOp) {
  const kind = String(op.kind)
  if (kind === 'relation_add') return relationAddText(op)
  if (kind === 'relation_remove') return targetText(op)
  if (kind === 'relation_update') return relationUpdateText(op)
  return `${scalarValueText(op, 'from')} -> ${scalarValueText(op, 'to')}`
}

function relationAddText(op: DiffOp) {
  const attrs = attributeText(op.attributes)
  return attrs ? `${targetText(op)}；${attrs}` : targetText(op)
}

function relationUpdateText(op: DiffOp) {
  const attrs = attributeText(op.attributes)
  const refs = refAttributeText(op.ref_attributes)
  const details = [attrs, refs].filter(Boolean).join('；')
  return details ? `${targetText(op)}；${details}` : `${targetText(op)} 的关系属性`
}

function attributeText(value: unknown) {
  if (!isRecord(value)) return ''
  const entries = Object.entries(value).slice(0, 2)
  const text = entries.map(([key, next]) => {
    if (isRecord(next) && ('from' in next || 'to' in next)) {
      return `${key}: ${valueText(next.from)} -> ${valueText(next.to)}`
    }
    return `${key}: ${valueText(next)}`
  })
  const rest = Object.keys(value).length - entries.length
  return rest > 0 ? `${text.join('、')} 等 ${rest + entries.length} 项` : text.join('、')
}

function refAttributeText(value: unknown) {
  if (!isRecord(value)) return ''
  const keys = Object.keys(value)
  if (keys.length === 0) return ''
  if (keys.length > 2) return `关联属性 ${keys.slice(0, 2).join('、')} 等 ${keys.length} 项`
  return `关联属性 ${keys.join('、')}`
}

function scalarValueText(op: DiffOp, side: 'from' | 'to') {
  const name = side === 'from' ? op.from_name : op.to_name
  return typeof name === 'string' && name ? trimText(name) : valueText(op[side])
}

function targetText(op: DiffOp) {
  if (typeof op.target_name === 'string' && op.target_name) return trimText(op.target_name)
  return typeof op.target_id === 'number' ? `#${op.target_id}` : '关系目标'
}

function valueText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '空'
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (Array.isArray(value)) return arrayText(value)
  if (typeof value === 'object') return objectText(value)
  return trimText(String(value))
}

function arrayText(values: unknown[]) {
  if (values.length === 0) return '空'
  const labels = values.map(value =>
    typeof value === 'object' && value ? objectText(value) : valueText(value),
  )
  return values.length > 2
    ? `${labels.slice(0, 2).join('、')} 等 ${values.length} 项`
    : labels.join('、')
}

function objectText(value: object) {
  if ('name' in value && typeof value.name === 'string') return trimText(value.name)
  if ('title' in value && typeof value.title === 'string') return trimText(value.title)
  if ('label' in value && typeof value.label === 'string') return trimText(value.label)
  if ('value' in value && typeof value.value !== 'object') return valueText(value.value)
  if ('src' in value) return '媒体'
  if ('id' in value && typeof value.id === 'number') return `#${value.id}`
  return '对象'
}

function isRecord(value: unknown): value is DiffOp {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function trimText(value: string) {
  const text = value.replace(/\s+/g, ' ').trim()
  return text.length > 56 ? `${text.slice(0, 56)}...` : text
}
