import type { BackendChangeRequestDetail } from '~/features/creator/contribution'

export function useCheckChoices(changeRequest: () => BackendChangeRequestDetail) {
  const fields = ref<Record<string, 'request' | 'original'>>({})
  const entities = ref<Record<number, 'existing' | 'new'>>({})
  const verification = computed(() => {
    const check = changeRequest().check
    return check?.status === 'DONE' ? (check.verification ?? null) : null
  })

  watch(
    () => changeRequest().check?.id,
    () => {
      const current = verification.value
      fields.value = Object.fromEntries(
        (current?.fields ?? [])
          .filter(field => field.verified && !field.applied)
          .map(field => [field.field, 'original' as const]),
      )
      entities.value = Object.fromEntries(
        (current?.entities ?? [])
          .filter(entity => entity.verified && entity.existing_id != null && !entity.applied)
          .map(entity => [entity.change_request_id, 'existing' as const]),
      )
    },
    { immediate: true },
  )

  const overrides = computed(() => {
    const identity = verification.value?.identity
    if (identity?.verified && (identity.kind === 'site' || identity.kind === 'pending')) return []
    return (verification.value?.fields ?? [])
      .filter(field => field.verified && !field.applied && fields.value[field.field] === 'original')
      .map(field => ({ field: field.field, value: field.value }))
  })
  const entityChoices = computed(() =>
    (verification.value?.entities ?? [])
      .filter(
        entity =>
          entity.verified &&
          entity.existing_id != null &&
          !entity.applied &&
          entities.value[entity.change_request_id] === 'existing',
      )
      .map(entity => ({
        change_request_id: entity.change_request_id,
        use_id: entity.existing_id!,
      })),
  )
  const count = computed(() => overrides.value.length + entityChoices.value.length)

  return { fields, entities, overrides, entityChoices, count }
}
