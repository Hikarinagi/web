<script setup lang="ts">
  import Form, { type FormInstance } from '@primevue/forms/form'
  import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
  import type { BackendEditorRef, BackendEditorSchema } from '~/features/creator/editor'
  import type { Changeset } from '~/features/creator/editor/changeset'
  import { EDITOR_PRESENTATIONS, sortFields } from '~/features/creator/editor/presentation'
  import {
    ENTITY_DRAWER_FOOTER_KEY,
    type EditorRelationRow,
  } from '~/features/creator/editor/relation'

  const props = defineProps<{
    slug: string
    resourceId: number
    schema: BackendEditorSchema
    snapshot: Record<string, unknown>
    refs: Record<string, BackendEditorRef>
    openChangeRequest: BackendChangeRequestDetail | null
    staged?: boolean
    stagedChangeset?: Changeset | null
  }>()
  const emit = defineEmits<{
    submitted: [result: BackendChangeRequestDetail]
    staged: [payload: { changeset: Changeset; needsReview: boolean }]
  }>()

  const presentation = EDITOR_PRESENTATIONS[props.slug]?.fields ?? {}
  const fields = sortFields(props.schema.fields, presentation)
  const fieldIdPrefix = `${useId()}-`
  const formDomId = useId()
  const footerEl = inject(ENTITY_DRAWER_FOOTER_KEY, ref(null))

  const {
    resolver,
    initialValues,
    snapshotValues,
    snapshotRelations,
    initialRefs,
    relations,
    relationErrors,
    isContinue,
    submitting,
    changeset,
    dialogOpen,
    needsReview,
    review,
    confirm,
    changedCount,
  } = useChangeRequestEditor({
    resourceType: props.slug,
    resourceId: props.resourceId,
    schema: props.schema,
    snapshot: props.snapshot,
    snapshotRefs: props.refs,
    openChangeRequest: props.openChangeRequest,
    presentation,
    onSubmitted: result => emit('submitted', result),
    stagedChangeset: props.stagedChangeset,
    onReview: props.staged
      ? (nextChangeset, needsReviewNow) => {
          if (nextChangeset.length === 0) return false
          emit('staged', { changeset: nextChangeset, needsReview: needsReviewNow })
          return true
        }
      : undefined,
    fieldIdPrefix,
  })

  const formEl = ref<FormInstance>()

  function onAddRelation(field: string, row: EditorRelationRow) {
    relations.value[field] = [...(relations.value[field] ?? []), row]
  }
</script>

<template>
  <Form
    :id="formDomId"
    ref="formEl"
    v-slot="$form"
    :initial-values="initialValues"
    :resolver="resolver"
    class="flex flex-col gap-5"
    @submit="review"
  >
    <Message v-if="isContinue" severity="warn" variant="simple" size="small">
      你正在续编自己进行中的变更请求，提交后将更新该请求
    </Message>

    <CreatorEditorFormFields
      v-model:relations="relations"
      :fields="fields"
      :presentation="presentation"
      :relation-errors="relationErrors"
      :initial-relations="snapshotRelations"
      :initial-values="snapshotValues"
      :initial-refs="initialRefs"
      :form-state="$form"
      :id-prefix="fieldIdPrefix"
    />

    <Teleport :to="footerEl ?? 'body'" :disabled="!footerEl">
      <div class="flex items-center gap-3">
        <CreatorEditorSyncTrigger
          :resource-type="slug"
          :resource-id="resourceId"
          :form-el="formEl ?? null"
          :fields="fields"
          :presentation="presentation"
          :relations="relations"
          @add="onAddRelation"
        />
        <span class="ml-auto text-sm text-muted-color">{{ changedCount($form) }} 项修改</span>
        <Button
          :label="staged ? '暂存修改' : '提交变更请求'"
          type="submit"
          :form="formDomId"
          :disabled="submitting || changedCount($form) === 0"
          :loading="submitting"
        />
      </div>
    </Teleport>

    <CreatorEditorSubmitDialog
      v-if="!staged"
      v-model:visible="dialogOpen"
      :changeset="changeset"
      :resource-type="schema.resource_type"
      :needs-review="needsReview"
      :submitting="submitting"
      :is-continue="isContinue"
      @confirm="confirm"
    />
  </Form>
</template>
