<script setup lang="ts">
  import { Form } from '@hina-ui/vue'
  import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
  import type { BackendEditorSchema } from '~/features/creator/editor'
  import { EDITOR_PRESENTATIONS, sortFields } from '~/features/creator/editor/presentation'

  const props = defineProps<{ schema: BackendEditorSchema; prefill: Record<string, unknown> }>()
  const emit = defineEmits<{ submitted: [result: BackendChangeRequestDetail] }>()

  const presentation = EDITOR_PRESENTATIONS['manga-volume']?.fields ?? {}
  const fields = computed(() =>
    sortFields(props.schema.fields, presentation).filter(field => field.field !== 'series_id'),
  )
  let confirmNow = () => {}
  const editor = useChangeRequestEditor({
    resourceType: 'manga-volume',
    resourceId: null,
    schema: props.schema,
    snapshot: {},
    prefill: props.prefill,
    snapshotRefs: {},
    openChangeRequest: null,
    presentation,
    onSubmitted: result => emit('submitted', result),
    onReview: next => {
      if (next.length) confirmNow()
      return true
    },
    fieldIdPrefix: 'volume-create-',
  })
  confirmNow = () => void editor.confirm('随漫画投稿新建单行本条目')
  const {
    rules,
    values,
    relations,
    relationErrors,
    initialRefs,
    snapshotValues,
    snapshotRelations,
    submitting,
    review,
  } = editor

  defineExpose({ submit: review, submitting })
</script>

<template>
  <Form :values="values" :rules="rules" :disabled="submitting" @submit="review">
    <CreatorEditorFormFields
      v-model:relations="relations"
      v-model:values="values"
      :fields="fields"
      :presentation="presentation"
      :relation-errors="relationErrors"
      :initial-relations="snapshotRelations"
      :initial-values="snapshotValues"
      :initial-refs="initialRefs"
      id-prefix="volume-create-"
    />
  </Form>
</template>
