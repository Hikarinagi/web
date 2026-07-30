<script setup lang="ts">
  import Message from 'primevue/message'
  import type { BackendEditorField } from '~/features/creator/editor'
  import type { EditorFieldPresentation } from '~/features/creator/editor/presentation'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'

  const props = defineProps<{
    field: BackendEditorField
    presentation?: EditorFieldPresentation
    error?: string
    initialRows?: EditorRelationRow[]
  }>()
  const model = defineModel<EditorRelationRow[]>({ default: () => [] })

  const label = computed(() => props.presentation?.label ?? props.field.field)
  const hint = computed(() => props.field.help ?? props.presentation?.help)
  const isMedia = computed(() => props.field.target === 'media')
  const isTag = computed(() => props.field.target === 'tag')
</script>

<template>
  <div class="space-y-1.5">
    <span class="flex items-center gap-1 text-sm font-medium">
      {{ label }}
      <span v-if="field.required" class="text-red-500" aria-hidden="true">*</span>
      <CreatorEditorFieldReset v-model="model" :initial="initialRows" />
    </span>
    <CreatorEditorRelationMediaList v-if="isMedia" v-model="model" :field="field" />
    <CreatorEditorRelationTagChips v-else-if="isTag" v-model="model" />
    <CreatorEditorRelationEntityList v-else v-model="model" :field="field" />
    <Message v-if="error" severity="error" size="small" variant="simple" class="mt-1">
      {{ error }}
    </Message>
    <small v-if="hint" class="block text-muted-color">{{ hint }}</small>
  </div>
</template>
