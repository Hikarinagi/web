import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { ValueDraft } from './editor/draft'

export type WikiHint = ApiData<'/api/v3/wiki/todos', 'get'>['items'][number]
export type HintProposal = NonNullable<WikiHint['proposal']>

export const HINT_KINDS: Record<WikiHint['kind'], string> = {
  SUGGESTED_EDIT: '建议编辑',
  NEW_BOOK_PLACEMENT: '新的出版版本待归入',
  NEW_GAME_PLACEMENT: '待归置的新游戏',
  POSSIBLE_DUPLICATE: '疑似重复',
  CONSTRAINT_VIOLATION: '约束违反',
  SOURCE_MISMATCH: '来源与站内值不一致',
  CLUE: '线索',
  DOWNSTREAM_DIFF: '下游对照差异',
  APPEARANCE_LABEL_CONFLICT: '出场角色编号冲突',
  CHARACTER_GROUP_CANDIDATE: '角色归并候选',
  CREDIT_LINK_CANDIDATE: '制作信息关联候选',
  IDENTIFIER_CONFLICT: '确定编号冲突',
  IMPORTED_NEEDS_SOURCE: '导入资料待补来源',
}

export function proposedValue(proposal: HintProposal, base: ValueDraft): ValueDraft {
  return {
    ...base,
    value_kind: 'VALUE',
    text: proposal.text,
    code: proposal.code,
    date: proposal.date,
    date_precision: proposal.date_precision,
    amount: proposal.amount,
    currency: proposal.currency,
    tax_included: proposal.tax_included,
    number: proposal.number,
    role: proposal.role ?? base.role,
    song: proposal.song ?? base.song,
    target: proposal.target ?? base.target,
  }
}

export function hintsOn(hints: WikiHint[], statement: number): WikiHint[] {
  return hints.filter(
    hint => hint.proposal?.current?.id === statement || hint.statement?.id === statement,
  )
}
