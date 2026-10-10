<script setup lang="ts">
  import { Inline, Panel, Text, toast } from '@hina-ui/vue'
  import { useDownloadEngine } from '~/features/download/useDownloadEngine'
  import { formatBytes } from '~/features/download/format'
  import type { DownloadsPageData } from '~~/server/api/pages/me/downloads.get'

  defineOptions({ name: 'MeDownloadCenter' })

  const props = defineProps<{ data: DownloadsPageData; refresh: () => Promise<void> }>()
  const engine = useDownloadEngine()
  const busy = ref<number | null>(null)

  type Task = DownloadsPageData['tasks'][number]

  const remaining = computed(() =>
    formatBytes(
      Math.max(0, props.data.limits.daily_limit_bytes - props.data.limits.daily_used_bytes),
    ),
  )

  async function resume(task: Task) {
    if (busy.value !== null) return
    busy.value = task.id
    try {
      await engine.resume(task, task.update_required_cards ?? 0)
    } catch (error) {
      if (error instanceof Error && error.message) toast.danger(error.message)
    } finally {
      busy.value = null
    }
  }

  async function remove(task: Task) {
    if (busy.value !== null) return
    busy.value = task.id
    try {
      await hikariRequest('/api/v3/user/me/downloads/{id}', {
        method: 'delete',
        path: { id: task.id },
      })
      await engine.cancel(task.id)
      await props.refresh()
    } finally {
      busy.value = null
    }
  }

  watch(
    () => [...engine.runs.values()].filter(run => run.state === 'done').length,
    () => void props.refresh(),
  )
</script>

<template>
  <Panel title="下载记录">
    <template #actions>
      <Inline gap="lg" :wrap="false">
        <Text size="sm" class="tabular-nums">
          <Text as="span" tone="muted">今日剩余</Text> {{ remaining }}
        </Text>
        <Text size="sm" class="tabular-nums">
          <Text as="span" tone="muted">下载卡</Text> {{ data.cards.available }} 张
        </Text>
      </Inline>
    </template>
    <MeDownloadTable
      :tasks="data.tasks"
      :runs="engine.runs"
      :interrupted="engine.interrupted"
      :busy="busy"
      @resume="resume"
      @pause="task => engine.pause(task.id)"
      @remove="remove"
    />
  </Panel>
</template>
