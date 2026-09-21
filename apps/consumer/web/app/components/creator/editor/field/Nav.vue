<script setup lang="ts">
  import { Anchor, Indicator, type AnchorItem } from '@hina-ui/vue'
  import type { BackendEditorField } from '~/features/creator/editor'
  import type { EditorFieldPresentation } from '~/features/creator/editor/presentation'

  const props = defineProps<{
    fields: BackendEditorField[]
    presentation: Record<string, EditorFieldPresentation>
    changedFields: Set<string>
    idPrefix?: string
  }>()
  const emit = defineEmits<{ navigate: [] }>()

  function anchorId(field: string) {
    return `${props.idPrefix ?? ''}editor-field-${field}`
  }

  const items = computed<AnchorItem[]>(() =>
    props.fields.map(field => ({
      id: anchorId(field.field),
      label: props.presentation[field.field]?.label ?? field.field,
    })),
  )

  const changedIds = computed(() => new Set([...props.changedFields].map(anchorId)))
</script>

<template>
  <Anchor :items="items" label="跳转到字段" @click="emit('navigate')">
    <template #trailing="{ item }">
      <Indicator v-if="changedIds.has(item.id)" tone="accent" label="已改动" />
    </template>
  </Anchor>
</template>
