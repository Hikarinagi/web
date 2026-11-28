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
  const { t, d } = useLocaleText()

  const filter = ref('')

  function state(task: Task) {
    const run = props.runs.get(task.id)
    const percent = run?.total ? Math.min(100, Math.round((run.written / run.total) * 100)) : 0
    if (run?.state === 'preparing') {
      return { kind: 'running' as const, label: t('download.state.preparing'), percent }
    }
    if (run?.state === 'saving') return { kind: 'running' as const, label: `${percent}%`, percent }
    if (run?.state === 'paused') {
      return { kind: 'paused' as const, label: t('download.state.paused'), percent }
    }
    if (run?.state === 'error' || props.interrupted.has(task.id)) {
      return { kind: 'error' as const, label: t('download.state.interrupted'), percent }
    }
    if (task.updated) {
      return { kind: 'updated' as const, label: t('download.state.updated'), percent }
    }
    return { kind: 'idle' as const, label: '', percent }
  }

  const columns = computed<DataTableColumn<Task>[]>(() => [
    {
      key: 'title',
      label: t('download.table.title'),
      field: 'title',
      sortable: true,
      truncate: true,
    },
    {
      key: 'format',
      label: t('download.table.format'),
      field: 'format',
      sortable: true,
      filterable: false,
    },
    {
      key: 'items',
      label: t('download.table.items'),
      accessor: row => row.items.length,
      format: (value, row) =>
        row.kind === 'MANGA'
          ? t('download.table.chapters', { count: Number(value) })
          : t('download.table.volumes', { count: Number(value) }),
      sortable: true,
      filterable: false,
      align: 'end',
    },
    {
      key: 'total_bytes',
      label: t('download.table.size'),
      field: 'total_bytes',
      format: value => formatBytes(Number(value)),
      sortable: true,
      filterable: false,
      align: 'end',
    },
    {
      key: 'created_at',
      label: t('download.table.time'),
      field: 'created_at',
      format: value => d(new Date(String(value)), 'numeric'),
      sortable: true,
      filterable: false,
    },
    {
      key: 'status',
      label: t('download.table.status'),
      accessor: row => state(row).label,
      filterable: false,
    },
    {
      key: 'actions',
      label: t('download.table.actions'),
      filterable: false,
      align: 'end',
      pin: 'end',
    },
  ])
</script>

<template>
  <DataTable
    v-model:filter="filter"
    :rows="tasks"
    :columns="columns"
    row-key="id"
    pagination
    :page-size="20"
    :label="t('download.table.label')"
    :empty-text="t('download.table.empty')"
  >
    <template #toolbar>
      <SearchInput
        v-model="filter"
        size="sm"
        :placeholder="t('download.table.search')"
        :aria-label="t('download.table.search')"
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
          :aria-label="t('download.progress', { title: row.title })"
        />
        <Text size="xs" tone="muted" class="shrink-0 tabular-nums">{{ state(row).label }}</Text>
      </Inline>
      <Tag v-else-if="state(row).kind === 'error'" tone="warning" size="sm">
        {{ t('download.state.interrupted') }}
      </Tag>
      <Tag v-else-if="state(row).kind === 'updated'" tone="info" size="sm">
        {{ t('download.state.updated') }}
      </Tag>
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
          {{ t('download.action.pause') }}
        </Button>
        <template v-else>
          <Button size="sm" variant="soft" :loading="busy === row.id" @click="emit('resume', row)">
            {{
              state(row).kind === 'paused' || state(row).kind === 'error'
                ? t('download.action.resume')
                : t('download.action.again')
            }}
          </Button>
          <Popconfirm
            :title="t('download.action.removeConfirm')"
            tone="danger"
            :confirm-text="t('download.action.remove')"
            @confirm="emit('remove', row)"
          >
            <IconButton
              :label="t('download.action.remove')"
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
