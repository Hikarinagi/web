import type { ComparedStatement } from '../values'
import { sameValue, valueOf, type EditableEntry, type EditorDraft } from './draft'

export function restoreInto(
  draft: EditorDraft,
  current: Pick<EditableEntry, 'id' | 'revision' | 'statements'>,
  version: ComparedStatement[],
) {
  if (draft.base[current.id] === undefined) draft.base[current.id] = current.revision
  const kept = new Set(version.map(item => item.id))
  for (const old of version) {
    const now = current.statements.find(item => item.id === old.id)
    if (!now) continue
    const value = valueOf(old)
    if (now.status === 'DEPRECATED' && !draft.restored.includes(now.id)) draft.restored.push(now.id)
    if (sameValue(valueOf(now), value)) {
      const { [now.id]: _same, ...rest } = draft.changed
      draft.changed = rest
    } else draft.changed[now.id] = value
  }
  for (const now of current.statements)
    if (now.status !== 'DEPRECATED' && !kept.has(now.id) && !(now.id in draft.removed))
      draft.removed[now.id] = null
}
