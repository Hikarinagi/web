<script setup lang="ts">
  import { Button, Panel, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { push } from 'notivue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { EDITOR_VALUES_KEY } from '~/features/creator/composables/useChangeRequestEditor'
  import { useEntityBackfill } from '~/features/creator/composables/useEntityBackfill'
  import { WORKSPACE_SESSION_KEY } from '~/features/creator/composables/useWorkspaceSession'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'
  import { loadWorkRoster } from '~/features/creator/editor/roster-load'
  import { readExternalIds, type SyncRoster } from '~/features/creator/editor/sync'

  const props = defineProps<{
    resourceType: string
    current?: Record<string, EditorRelationRow[]>
  }>()

  const { canAny } = useCreatorPermissions()
  const session = inject(WORKSPACE_SESSION_KEY)!
  const values = inject(EDITOR_VALUES_KEY, {})

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
  <Panel
    v-if="canAny(WIKI_PERMISSIONS.REVIEW) && rosterCapable"
    title="补全关联实体资料"
    :count="started ? visible.length : undefined"
    description="从外部源逐字段补全本作品关联的人物 / 角色 / 厂商等实体的空缺资料，仅需要时手动触发。"
  >
    <template #actions>
      <Button v-if="!started" size="sm" :loading="loading" @click="begin">开始补全</Button>
      <Button
        v-else
        size="sm"
        :loading="running"
        :disabled="running || ready.length === 0"
        @click="applyAll"
      >
        应用所选（{{ ready.length }}）
      </Button>
    </template>
    <Text v-if="!started" size="sm" tone="muted">
      点击「开始补全」从外部源拉取本作品的关联实体，逐项列出可填补的空缺字段。
    </Text>
    <Stack v-else-if="discovering && !visible.length" gap="sm">
      <Skeleton v-for="i in 3" :key="i" as="div" class="h-16 rounded-lg" />
    </Stack>
    <Text v-else-if="!visible.length" size="sm" tone="muted">
      关联实体资料均已与外部源一致，没有可补全的内容。
    </Text>
    <Stack v-else gap="sm">
      <Text v-if="discovering" as="span" size="xs" tone="muted">正在对比外部源…</Text>
      <CreatorEditorImportBackfillCard
        v-for="item in visible"
        :key="`${item.target}:${item.id}`"
        :item="item"
        :running="running"
      />
    </Stack>
  </Panel>
</template>
