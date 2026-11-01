import type { Ref } from 'vue'
import type { EditorRelationRow } from '~/features/creator/editor/relation'

export function useRelationOps(relations: Ref<Record<string, EditorRelationRow[]>>) {
  function add(field: string, row: EditorRelationRow) {
    relations.value[field] = [...(relations.value[field] ?? []), row]
  }

  function update(field: string, targetId: number, row: EditorRelationRow) {
    relations.value[field] = (relations.value[field] ?? []).map(existing =>
      existing.target_id === targetId ? row : existing,
    )
  }

  function remove(field: string, targetId: number) {
    relations.value[field] = (relations.value[field] ?? []).filter(
      existing => existing.target_id !== targetId,
    )
  }

  return { add, update, remove }
}
