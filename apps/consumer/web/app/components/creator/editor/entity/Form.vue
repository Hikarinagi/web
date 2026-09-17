<script setup lang="ts">
  import { Alert, Button, Form, Inline, Text } from '@hina-ui/vue'
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
    rules,
    values,
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

  function onAddRelation(field: string, row: EditorRelationRow) {
    relations.value[field] = [...(relations.value[field] ?? []), row]
  }
</script>

<template>
  <Form :id="formDomId" :values="values" :rules="rules" @submit="review">
    <Alert :open="isContinue" tone="warning">
      你正在续编自己进行中的变更请求，提交后将更新该请求
    </Alert>

    <CreatorEditorFormFields
      v-model:relations="relations"
      v-model:values="values"
      :fields="fields"
      :presentation="presentation"
      :relation-errors="relationErrors"
      :initial-relations="snapshotRelations"
      :initial-values="snapshotValues"
      :initial-refs="initialRefs"
      :id-prefix="fieldIdPrefix"
    />

    <Teleport :to="footerEl ?? 'body'" :disabled="!footerEl">
      <Inline gap="sm" align="center" :wrap="false">
        <CreatorEditorSyncTrigger
          :resource-type="slug"
          :resource-id="resourceId"
          :fields="fields"
          :presentation="presentation"
          :relations="relations"
          @add="onAddRelation"
        />
        <Text size="sm" tone="muted" class="ms-auto">{{ changedCount }} 项修改</Text>
        <Button
          type="submit"
          :form="formDomId"
          :disabled="submitting || changedCount === 0"
          :loading="submitting"
        >
          {{ staged ? '暂存修改' : '提交变更请求' }}
        </Button>
      </Inline>
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
