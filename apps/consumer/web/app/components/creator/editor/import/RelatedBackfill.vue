<script setup lang="ts">
  import type { FormInstance } from '@primevue/forms/form'
  import { push } from 'notivue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { useEntityBackfill } from '~/features/creator/composables/useEntityBackfill'
  import { WORKSPACE_SESSION_KEY } from '~/features/creator/composables/useWorkspaceSession'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'
  import { loadWorkRoster } from '~/features/creator/editor/roster-load'
  import { readExternalIds, type SyncRoster } from '~/features/creator/editor/sync'

  const props = defineProps<{
    resourceType: string
    formEl: FormInstance | null
    current?: Record<string, EditorRelationRow[]>
  }>()

  const { canAny } = useCreatorPermissions()
  const session = inject(WORKSPACE_SESSION_KEY)!

  const rosterCapable = computed(
    () => props.resourceType === 'galgame' || props.resourceType === 'light-novel',
  )

  const roster = ref<SyncRoster | null>(null)
  const loading = ref(false)
  const running = ref(false)

  const { items, discovering, started, start, apply } = useEntityBackfill({
    roster: () => roster.value,
    relations: () => props.current ?? {},
    session,
  })

  const visible = computed(() => items.value.filter(item => item.status !== 'nothing'))
  const ready = computed(() =>
    items.value.filter(item => item.status === 'ready' && item.fields.some(field => field.checked)),
  )

  async function begin() {
    if (loading.value || started.value) return
    loading.value = true
    try {
      const states = props.formEl?.states ?? {}
      const values = Object.fromEntries(
        Object.entries(states).map(([key, state]) => [key, (state as { value?: unknown })?.value]),
      )
      const ids = readExternalIds(props.resourceType, values)
      if (!ids) {
        push.warning({ message: '此条目没有登记 Bangumi / VNDB 外部源 ID，无法补全关联实体' })
        return
      }
      const loaded = await loadWorkRoster(props.resourceType, ids)
      if (!loaded) {
        push.error({ message: '拉取外部源数据失败，稍后重试' })
        return
      }
      roster.value = loaded
      start()
    } finally {
      loading.value = false
    }
  }

  async function applyAll() {
    if (running.value || !ready.value.length) return
    running.value = true
    let fail = 0
    try {
      const tasks = ready.value.map(item => async () => {
        if (!(await apply(item))) fail += 1
      })
      const worker = async () => {
        for (let task = tasks.shift(); task; task = tasks.shift()) await task()
      }
      await Promise.all(Array.from({ length: 4 }, () => worker()))
      if (fail) push.error({ message: `${fail} 项补全失败，可重试` })
      else push.success({ message: '关联实体资料补全已暂存，随本次提交生效' })
    } finally {
      running.value = false
    }
  }
</script>

<template>
  <CardPanel
    v-if="canAny(WIKI_PERMISSIONS.REVIEW) && rosterCapable"
    title="补全关联实体资料"
    :count="started ? visible.length : undefined"
    description="从外部源逐字段补全本作品关联的人物 / 角色 / 厂商等实体的空缺资料，仅需要时手动触发。"
  >
    <template #actions>
      <Button v-if="!started" size="small" label="开始补全" :loading="loading" @click="begin" />
      <Button
        v-else
        size="small"
        :label="`应用所选（${ready.length}）`"
        :loading="running"
        :disabled="running || ready.length === 0"
        @click="applyAll"
      />
    </template>
    <p v-if="!started" class="text-sm text-muted-color">
      点击「开始补全」从外部源拉取本作品的关联实体，逐项列出可填补的空缺字段。
    </p>
    <div v-else-if="discovering && !visible.length" class="flex flex-col gap-2">
      <Skeleton v-for="i in 3" :key="i" height="4rem" />
    </div>
    <p v-else-if="!visible.length" class="text-sm text-muted-color">
      关联实体资料均已与外部源一致，没有可补全的内容。
    </p>
    <div v-else class="flex flex-col gap-2">
      <span v-if="discovering" class="text-xs text-muted-color">正在对比外部源…</span>
      <CreatorEditorImportBackfillCard
        v-for="item in visible"
        :key="`${item.target}:${item.id}`"
        :item="item"
        :running="running"
      />
    </div>
  </CardPanel>
</template>
