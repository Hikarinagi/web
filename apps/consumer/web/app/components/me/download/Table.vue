<script setup lang="ts">
  import {
    Button,
    DataTable,
    IconButton,
    Inline,
    Popconfirm,
    Progress,
    SearchInput,
    Tag,
    Text,
    type DataTableColumn,
  } from '@hina-ui/vue'
  import { Trash2 } from '@lucide/vue'
  import type { RunSnapshot } from '~/features/download/engine/types'
  import { formatBytes } from '~/features/download/format'
  import type { DownloadsPageData } from '~~/server/api/pages/me/downloads.get'

  defineOptions({ name: 'MeDownloadTable' })

  type Task = DownloadsPageData['tasks'][number]

  const props = defineProps<{
    tasks: Task[]
    runs: ReadonlyMap<number, RunSnapshot>
    interrupted: ReadonlySet<number>
    busy: number | null
  }>()
  const emit = defineEmits<{ resume: [task: Task]; pause: [task: Task]; remove: [task: Task] }>()

  const filter = ref('')

  function state(task: Task) {
    const run = props.runs.get(task.id)
    const percent = run?.total ? Math.min(100, Math.round((run.written / run.total) * 100)) : 0
    if (run?.state === 'preparing') return { kind: 'running' as const, label: '准备中', percent }
    if (run?.state === 'saving') return { kind: 'running' as const, label: `${percent}%`, percent }
    if (run?.state === 'paused') return { kind: 'paused' as const, label: '已暂停', percent }
    if (run?.state === 'error' || props.interrupted.has(task.id))
      return { kind: 'error' as const, label: '已中断', percent }
    if (task.updated) return { kind: 'updated' as const, label: '有更新', percent }
    return { kind: 'idle' as const, label: '', percent }
  }

  const columns: DataTableColumn<Task>[] = [
    { key: 'title', label: '作品', field: 'title', sortable: true, truncate: true },
    { key: 'format', label: '格式', field: 'format', sortable: true, filterable: false },
    {
      key: 'items',
      label: '数量',
      accessor: row => row.items.length,
      format: (value, row) => `${value} ${row.kind === 'MANGA' ? '话' : '卷'}`,
      sortable: true,
      filterable: false,
      align: 'end',
    },
    {
      key: 'total_bytes',
      label: '大小',
      field: 'total_bytes',
      format: value => formatBytes(Number(value)),
      sortable: true,
      filterable: false,
      align: 'end',
    },
    {
      key: 'created_at',
      label: '时间',
      field: 'created_at',
      format: value => new Date(String(value)).toLocaleDateString('zh-CN'),
      sortable: true,
      filterable: false,
    },
    {
      key: 'status',
      label: '状态',
      accessor: row => state(row).label,
      filterable: false,
    },
    { key: 'actions', label: '操作', filterable: false, align: 'end', pin: 'end' },
  ]
</script>

<template>
  <DataTable
    v-model:filter="filter"
    :rows="tasks"
    :columns="columns"
    row-key="id"
    pagination
    :page-size="20"
    label="下载记录"
    empty-text="暂无下载"
  >
    <template #toolbar>
      <SearchInput
        v-model="filter"
        size="sm"
        placeholder="搜索作品"
        aria-label="搜索作品"
        class="w-64 max-w-full"
      />
    </template>
    <template #cell-status="{ row }">
      <Inline
        v-if="state(row).kind === 'running' || state(row).kind === 'paused'"
        gap="sm"
        align="center"
        :wrap="false"
        class="min-w-32 py-1"
      >
        <Progress
          :value="state(row).percent"
          size="sm"
          class="flex-1"
          :aria-label="`${row.title} 的保存进度`"
        />
        <Text size="xs" tone="muted" class="shrink-0 tabular-nums">{{ state(row).label }}</Text>
      </Inline>
      <Tag v-else-if="state(row).kind === 'error'" tone="warning" size="sm">已中断</Tag>
      <Tag v-else-if="state(row).kind === 'updated'" tone="info" size="sm">有更新</Tag>
      <Text v-else size="sm" tone="muted">—</Text>
    </template>
    <template #cell-actions="{ row }">
      <Inline gap="xs" align="center" justify="end" :wrap="false" class="py-1">
        <Button
          v-if="runs.get(row.id)?.state === 'saving' || runs.get(row.id)?.state === 'preparing'"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="emit('pause', row)"
        >
          暂停
        </Button>
        <template v-else>
          <Button size="sm" variant="soft" :loading="busy === row.id" @click="emit('resume', row)">
            {{ state(row).kind === 'paused' || state(row).kind === 'error' ? '继续' : '再次保存' }}
          </Button>
          <Popconfirm
            title="移除这条下载记录？"
            tone="danger"
            confirm-text="移除"
            @confirm="emit('remove', row)"
          >
            <IconButton
              label="移除"
              variant="ghost"
              tone="neutral"
              size="sm"
              :disabled="busy === row.id"
            >
              <Trash2 aria-hidden="true" />
            </IconButton>
          </Popconfirm>
        </template>
      </Inline>
    </template>
  </DataTable>
</template>
