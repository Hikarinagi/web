<script setup lang="ts">
  import { push } from 'notivue'
  import PrimeDrawer from 'primevue/drawer'
  import { useEntityDrawer } from '~/features/creator/composables/useEntityDrawer'
  import {
    WORKSPACE_SESSION_KEY,
    type WorkspaceEntityTarget,
  } from '~/features/creator/composables/useWorkspaceSession'
  import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
  import type { Changeset } from '~/features/creator/editor/changeset'
  import {
    ENTITY_DRAWER_FOOTER_KEY,
    IN_ENTITY_DRAWER_KEY,
  } from '~/features/creator/editor/relation'

  const props = defineProps<{
    editing: { target: WorkspaceEntityTarget; id: number } | null
  }>()
  const emit = defineEmits<{
    close: []
    updated: [
      payload: { target: WorkspaceEntityTarget; id: number; name: string; cover: string | null },
    ]
  }>()

  const session = inject(WORKSPACE_SESSION_KEY, null)
  const staged = computed(() => !!session?.enabled)
  const stagedChangeset = computed<Changeset | null>(() => {
    const editing = props.editing
    if (!editing || !session?.enabled) return null
    return session.memberFor(editing.target, editing.id)?.changeset ?? null
  })

  const visible = computed({
    get: () => props.editing !== null,
    set: value => {
      if (!value) emit('close')
    },
  })

  const { loading, failed, data, mineCr, blocked } = useEntityDrawer(() => props.editing)

  const footerEl = ref<HTMLElement | null>(null)
  provide(IN_ENTITY_DRAWER_KEY, true)
  provide(ENTITY_DRAWER_FOOTER_KEY, footerEl)

  function onSubmitted(result: BackendChangeRequestDetail) {
    const editing = props.editing
    if (!editing) return
    if (result.status === 'MERGED' && result.resource) {
      emit('updated', {
        target: editing.target,
        id: editing.id,
        name: result.resource.title,
        cover: result.resource.cover,
      })
      push.success({ message: '修改已生效' })
    } else {
      push.success({ message: mineCr.value ? '已更新变更请求' : '已提交，等待审核' })
    }
    emit('close')
  }

  function onStaged(payload: { changeset: Changeset; needsReview: boolean }) {
    const editing = props.editing
    if (!editing || !session || payload.changeset.length === 0) return
    session.stage({
      target: editing.target,
      id: editing.id,
      name: data.value?.resource?.title ?? '',
      cover: data.value?.resource?.cover ?? null,
      changeset: payload.changeset,
      needsReview: payload.needsReview,
      openChangeRequestId: mineCr.value?.id ?? null,
    })
    push.success({ message: '已暂存，随本次会话一起提交' })
    emit('close')
  }
</script>

<template>
  <PrimeDrawer
    v-model:visible="visible"
    position="right"
    :block-scroll="true"
    :header="data?.resource?.title ?? '编辑条目'"
    class="w-full! sm:w-136!"
  >
    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton v-for="n in 6" :key="n" height="3.5rem" />
    </div>

    <CreatorEmpty v-else-if="failed" text="加载失败，关闭后重试" />

    <CreatorEditorBlockedCard
      v-else-if="blocked && data?.openCr"
      :change-request-id="data.openCr.id"
    />

    <CreatorEditorEntityForm
      v-else-if="data && editing"
      :key="`${editing.target}:${editing.id}`"
      :slug="editing.target"
      :resource-id="editing.id"
      :schema="data.schema"
      :snapshot="data.snapshot"
      :refs="data.refs"
      :open-change-request="mineCr"
      :staged="staged"
      :staged-changeset="stagedChangeset"
      @submitted="onSubmitted"
      @staged="onStaged"
    />

    <template v-if="data && editing && !blocked" #footer>
      <div ref="footerEl" class="w-full" />
    </template>
  </PrimeDrawer>
</template>
