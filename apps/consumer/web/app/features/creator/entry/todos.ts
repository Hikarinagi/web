import type { BackendPropertyDefinition, BackendStatement, BackendTodo } from './contract'
import { codeLabel, statementText } from './values'

const KIND_TEXT: Record<string, string> = {
  SUGGESTED_EDIT: '维基机器人提出编辑建议',
  POSSIBLE_DUPLICATE: '可能与以下条目为同一条目',
  SOURCE_MISMATCH: '来源与其值不匹配',
  DOWNSTREAM_DIFF: '与另一数据库不一致',
  NEW_BOOK_PLACEMENT: '新书需归入某一系列',
  NEW_GAME_PLACEMENT: '可能是站内已有的游戏',
  APPEARANCE_LABEL_CONFLICT: '出场角色的名称记录存在冲突',
  CHARACTER_GROUP_CANDIDATE: '这些出场角色可能是同一角色',
  CREDIT_LINK_CANDIDATE: '此名称可能是站内已有的人物',
}

export function todoText(
  todo: BackendTodo,
  statements: BackendStatement[],
  definitions: BackendPropertyDefinition[],
  list = false,
): string {
  const evidence = todo.evidence
  const label = (property: unknown) =>
    definitions.find(item => item.property === property)?.label ?? String(property ?? '')
  if (todo.kind === 'CLUE' || todo.kind === 'IMPORTED_NEEDS_SOURCE') {
    const statement = todo.statement ?? statements.find(item => item.id === evidence.statement_id)
    if (statement) {
      const value = `${label(statement.property)}「${statementText(statement)}」`
      return todo.kind === 'CLUE' ? `${value}没有来源` : `${value}为导入内容，需要来源`
    }
  }
  if (todo.kind === 'IDENTIFIER_CONFLICT' && typeof evidence.key === 'string') {
    const [property = '', code = '', text = ''] = evidence.key.split('|')
    const name = property.toUpperCase() as BackendStatement['property']
    const shown = code ? `${codeLabel(name, code)} ${text}` : `${label(name)} ${text}`
    return list ? `这些条目记录了相同的 ${shown}` : `以下条目中也记录了 ${shown}`
  }
  if (todo.kind === 'CONSTRAINT_VIOLATION') {
    const property = label(evidence.property)
    if (evidence.reason === 'duplicate') return `${property}存在重复的值`
    if (evidence.reason === 'date') return `${property}含有不存在的日期`
    return `${property}违反了规则`
  }
  if (list && todo.kind === 'POSSIBLE_DUPLICATE') return '这些条目可能是同一条目'
  return KIND_TEXT[todo.kind] ?? todo.kind
}

export function clueOf(todo: BackendTodo, statements: BackendStatement[]): BackendStatement | null {
  if (todo.kind !== 'CLUE' && todo.kind !== 'IMPORTED_NEEDS_SOURCE') return null
  return (
    statements.find(
      item => item.id === todo.evidence.statement_id && item.status !== 'DEPRECATED',
    ) ?? null
  )
}
