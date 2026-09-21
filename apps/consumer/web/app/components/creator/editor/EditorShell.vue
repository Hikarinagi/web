<script setup lang="ts">
  import type { CreatorEditorPageData } from '~~/server/api/pages/create/editor/[type]/[id].get'
  import type { PrefillRelations } from '~~/server/api/pages/create/editor/new/[type].get'
  import type { ComponentPublicInstance } from 'vue'
  import { Card, Drawer, Form, Inline, ScrollArea, Stack } from '@hina-ui/vue'
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

  useWorkRosterLoader(session, values, props.resourceType)

  const suggestionSource = computed(() =>
    suggestionSourceOf(syncRoster.value, props.pageData.prefill_relations),
  )

  const actionBar = useTemplateRef<ComponentPublicInstance>('actionBar')
  const { height: actionBarHeight } = useElementSize(
    () => unrefElement(actionBar),
    { width: 0, height: 0 },
    { box: 'border-box' },
  )
  const shellStyle = computed(() =>
    actionBarHeight.value > 0
      ? { '--creator-editor-actionbar-height': `${Math.round(actionBarHeight.value)}px` }
      : undefined,
  )
</script>

<template>
  <Stack gap="lg" :style="shellStyle">
    <Card v-if="resourceId != null">
      <CreatorResourceHead
        :id="resourceId"
        :type="pageData.schema.resource_type"
        :resource="pageData.resource"
      />
    </Card>

    <Card v-if="blocked">
      <CreatorEditorBlockedCard :change-request-id="openCr!.id" />
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

      <CreatorEditorImportRelatedBackfill :resource-type="resourceType" :current="relations" />

      <Form
        :values="values"
        :rules="rules"
        :class="session.memberList.value.length ? 'pb-40' : 'pb-24'"
        @submit="review"
      >
        <Inline align="start" gap="lg" :wrap="false">
          <Card class="min-w-0 flex-1">
            <CreatorEditorFormFields
              v-model:relations="relations"
              v-model:values="values"
              :fields="fields"
              :presentation="presentation"
              :relation-errors="relationErrors"
              :initial-relations="snapshotRelations"
              :initial-values="snapshotValues"
              :initial-refs="initialRefs"
            />
          </Card>

          <Card
            :padded="false"
            class="sticky top-6 hidden max-h-[calc(100vh-var(--creator-topbar-height)-var(--creator-editor-actionbar-height,6rem)-3rem)] w-52 shrink-0 flex-col lg:flex"
          >
            <ScrollArea :shadow="false" class="min-h-0">
              <CreatorEditorFieldNav
                :fields="fields"
                :presentation="presentation"
                :changed-fields="changedFields"
                class="p-(--hn-panel-p)"
              />
            </ScrollArea>
          </Card>
        </Inline>

        <CreatorEditorActionBar
          ref="actionBar"
          :resource-type="resourceType"
          :resource-id="resourceId"
          :fields="fields"
          :presentation="presentation"
          :relations="relations"
          :changed-count="changedCount"
          :submitting="submitting || session.submitting.value"
          :disabled="
            submitting ||
            session.submitting.value ||
            (changedCount === 0 && session.memberList.value.length === 0)
          "
          @add="onAddRelation"
          @roster="onRoster"
          @open-nav="navOpen = true"
        />
      </Form>

      <Drawer v-model:open="navOpen" side="end" size="sm" title="跳转到字段">
        <template #content>
          <CreatorEditorFieldNav
            :fields="fields"
            :presentation="presentation"
            :changed-fields="changedFields"
            @navigate="navOpen = false"
          />
        </template>
      </Drawer>

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
  </Stack>
</template>
