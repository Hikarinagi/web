import type { FormFieldState } from '@primevue/forms/form'
import type { BackendEditorField } from '~/features/creator/editor'

export function scrollToFirstError(
  fields: readonly BackendEditorField[],
  scalarStates: Record<string, FormFieldState> | undefined,
  relationErrors: Record<string, string>,
  idPrefix = '',
): void {
  if (typeof document === 'undefined') return
  for (const field of fields) {
    const failed =
      field.kind === 'scalar'
        ? !!scalarStates?.[field.field]?.invalid
        : !!relationErrors[field.field]
    if (!failed) continue
    document
      .getElementById(`${idPrefix}editor-field-${field.field}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
}
