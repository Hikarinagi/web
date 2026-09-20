<script setup lang="ts">
  import type { CreatorEditorPageData } from '~~/server/api/pages/create/editor/[type]/[id].get'
  import type { PrefillRelations } from '~~/server/api/pages/create/editor/new/[type].get'
  import Form, { type FormInstance } from '@primevue/forms/form'
  import {
    WORKSPACE_SESSION_KEY,
    useWorkspaceSession,
  } from '~/features/creator/composables/useWorkspaceSession'
  import { useWorkRosterLoader } from '~/features/creator/composables/useWorkRosterLoader'
  import { useRelationOps } from '~/features/creator/composables/useRelationOps'
  import { seedPrefill } from '~/features/creator/editor/import'
  import { EDITOR_PRESENTATIONS, sortFields } from '~/features/creator/editor/presentation'
  import {
    rosterHintEntries,
    suggestionSourceOf,
    type SyncRoster,
  } from '~/features/creator/editor/sync'
  import { RESOURCE_TYPE_LABEL } from '~/features/creator/labels'

  const props = defineProps<{
    pageData: Omit<CreatorEditorPageData, 'resource'> & {
      resource: CreatorEditorPageData['resource'] | null
      prefill?: Record<string, unknown>
      prefill_relations?: PrefillRelations | null
      sources_match?: boolean | null
    }
    resourceType: string
    resourceId: number | null
  }>()

  const seededPrefill = computed(() =>
    seedPrefill(props.pageData.prefill, props.pageData.prefill_relations),
  )
  const navOpen = ref(false)
  const syncRoster = ref<SyncRoster | null>(null)

  const presentation = computed(() => EDITOR_PRESENTATIONS[props.resourceType]?.fields ?? {})
  const fields = computed(() => sortFields(props.pageData.schema.fields, presentation.value))

  const { subtitle } = useCreatorTopbar()
  watchEffect(() => {
    const typeLabel =
      RESOURCE_TYPE_LABEL[props.pageData.schema.resource_type] ??
      props.pageData.schema.resource_type
    subtitle.value =
      props.pageData.resource?.title || (props.resourceId == null ? `新建${typeLabel}` : null)
  })
  onBeforeUnmount(() => {
    subtitle.value = null
  })

  const auth = useAuthStore()
  const openCr = props.pageData.open_change_request
  const mineCr = openCr && openCr.author.id === auth.user?.id ? openCr : null
  const blocked = !!openCr && !mineCr

  const session = useWorkspaceSession({
    enabled: props.resourceId != null,
    work: {
      resourceType: props.pageData.schema.resource_type,
      resourceId: props.resourceId,
      openChangeRequestId: mineCr?.id ?? null,
    },
  })
  provide(WORKSPACE_SESSION_KEY, session)

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
    changedFields,
  } = useChangeRequestEditor({
    resourceType: props.resourceType,
    resourceId: props.resourceId,
    schema: props.pageData.schema,
    snapshot: props.pageData.snapshot,
    prefill: seededPrefill.value,
    snapshotRefs: props.pageData.refs,
    openChangeRequest: mineCr,
    presentation: presentation.value,
    onReview: (nextChangeset, needsReviewNow) => session.review(nextChangeset, needsReviewNow),
  })

  const formEl = ref<FormInstance>()

  const relationOps = useRelationOps(relations)
  const rosterCtx = {
    addRow: relationOps.add,
    updateRow: relationOps.update,
    removeRow: relationOps.remove,
  }
  const onAddRelation = relationOps.add

  function onRoster(roster: SyncRoster) {
    syncRoster.value = roster
    session.addRosterHints(rosterHintEntries(roster))
  }

  useWorkRosterLoader(session, formEl, props.resourceType)

  const suggestionSource = computed(() =>
    suggestionSourceOf(syncRoster.value, props.pageData.prefill_relations),
  )
</script>

<template>
  <div class="flex flex-col gap-5">
    <Card v-if="resourceId != null">
      <template #content>
        <CreatorResourceHead
          :id="resourceId"
          :type="pageData.schema.resource_type"
          :resource="pageData.resource"
        />
      </template>
    </Card>

    <Card v-if="blocked">
      <template #content>
        <CreatorEditorBlockedCard :change-request-id="openCr!.id" />
      </template>
    </Card>

    <template v-else>
      <CreatorEditorNotices
        :is-continue="isContinue"
        :sources-match="pageData.sources_match ?? null"
      />

      <CreatorEditorImportSuggestions
        v-if="suggestionSource"
        :roster="suggestionSource"
        :current="relations"
        :ctx="rosterCtx"
      />

      <CreatorEditorImportRelatedBackfill
        :resource-type="resourceType"
        :form-el="formEl ?? null"
        :current="relations"
      />

      <Form
        ref="formEl"
        v-slot="$form"
        :initial-values="initialValues"
        :resolver="resolver"
        :class="session.memberList.value.length ? 'pb-40' : 'pb-24'"
        @submit="review"
      >
        <div class="flex items-start gap-5">
          <Card class="min-w-0 flex-1">
            <template #content>
              <CreatorEditorFormFields
                v-model:relations="relations"
                :fields="fields"
                :presentation="presentation"
                :relation-errors="relationErrors"
                :initial-relations="snapshotRelations"
                :initial-values="snapshotValues"
                :initial-refs="initialRefs"
                :form-state="$form"
              />
            </template>
          </Card>

          <div class="sticky top-20 hidden w-52 shrink-0 lg:block">
            <Card>
              <template #content>
                <CreatorEditorFieldNav
                  :fields="fields"
                  :presentation="presentation"
                  :changed-fields="changedFields($form)"
                />
              </template>
            </Card>
          </div>
        </div>

        <CreatorEditorActionBar
          :resource-type="resourceType"
          :resource-id="resourceId"
          :form-el="formEl ?? null"
          :fields="fields"
          :presentation="presentation"
          :relations="relations"
          :changed-count="changedCount($form)"
          :submitting="submitting || session.submitting.value"
          :disabled="
            submitting ||
            session.submitting.value ||
            (changedCount($form) === 0 && session.memberList.value.length === 0)
          "
          @add="onAddRelation"
          @roster="onRoster"
          @open-nav="navOpen = true"
        />

        <Drawer v-model:visible="navOpen" position="right" header="跳转到字段" class="lg:hidden!">
          <CreatorEditorFieldNav
            :fields="fields"
            :presentation="presentation"
            :changed-fields="changedFields($form)"
            @navigate="navOpen = false"
          />
        </Drawer>
      </Form>

      <CreatorEditorSubmitDialog
        v-model:visible="dialogOpen"
        :changeset="changeset"
        :resource-type="pageData.schema.resource_type"
        :needs-review="needsReview"
        :submitting="submitting"
        :is-continue="isContinue"
        @confirm="confirm"
      />

      <CreatorEditorSessionHost
        v-model:relations="relations"
        :fields="fields"
        :work-resource-type="pageData.schema.resource_type"
      />
    </template>
  </div>
</template>
