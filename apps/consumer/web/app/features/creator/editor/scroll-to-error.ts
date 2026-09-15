import type { BackendEditorField } from '~/features/creator/editor'

export function scrollToFirstError(
  fields: readonly BackendEditorField[],
  relationErrors: Record<string, string>,
  idPrefix = '',
): void {
  if (typeof document === 'undefined') return
  for (const field of fields) {
    if (field.kind === 'scalar' || !relationErrors[field.field]) continue
    document
      .getElementById(`${idPrefix}editor-field-${field.field}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
}
