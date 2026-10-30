<script setup lang="ts">
  import { Button, Checkbox, Inline, Stack, Tag, Text, type DataTableColumn } from '@hina-ui/vue'
  import { GitCompare } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { PageResult } from '@hikarinagi/shared'
  import type { BackendHistoryRow } from '~/features/creator/entry/contract'
  import { revisionTime } from '~/features/entry/time'

  type Row = BackendHistoryRow & { id: number }
  defineOptions({ name: 'CreatorEntryHistoryTable' })
  const props = defineProps<{
    history: PageResult<Row>
    loading: boolean
    revisionTo: (revision: number) => string | null
    compareTo: (from: number, to: number) => string
  }>()
  defineEmits<{ changed: [] }>()
  const page = defineModel<number>('page', { required: true })

  const columns: DataTableColumn<Row>[] = [
    { key: 'select', label: '选择' },
    { key: 'time', label: '时间' },
    { key: 'editor', label: '编辑者' },
    { key: 'summary', label: '编辑摘要' },
    { key: 'actions', label: '操作' },
  ]
  const selected = ref<number[]>([])
  const toggle = (revision: number, on: boolean) => {
    const rest = selected.value.filter(item => item !== revision)
    selected.value = on ? [...rest, revision].slice(-2) : rest
  }
  const compareTo = computed(() => {
    if (selected.value.length !== 2) return null
    const [from, to] = [...selected.value].sort((a, b) => a - b)
    return props.compareTo(from!, to!)
  })

  function open(row: Row) {
    const to = row.revision === null ? null : props.revisionTo(row.revision)
    if (to) void navigateTo(to)
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="修订历史"
    :list="history"
    :columns="columns"
    :loading="loading"
    :count="history.meta.total_items"
    @row-click="open"
  >
    <template #actions>
      <Button
        :as="compareTo ? NuxtLink : 'button'"
        :to="compareTo ?? undefined"
        :disabled="!compareTo"
        size="sm"
      >
        <template #icon><GitCompare /></template>
        比较所选的两条修订
      </Button>
    </template>
    <template #cell-select="{ row }">
      <Checkbox
        v-if="row.revision !== null"
        :model-value="selected.includes(row.revision)"
        aria-label="选择此修订"
        class="py-3"
        @click.stop
        @update:model-value="value => row.revision !== null && toggle(row.revision, value === true)"
      />
    </template>
    <template #cell-time="{ row }">
      <Text as="span" size="sm" tone="muted" class="py-3 whitespace-nowrap">
        {{ revisionTime(row.created_at) }}
      </Text>
    </template>
    <template #cell-editor="{ row }">
      <Inline gap="sm" align="center" :wrap="false" class="py-3">
        <Avatar :user="row.editor" class="size-6!" />
        <UserName :user="row.editor" class="min-w-0 text-sm" />
      </Inline>
    </template>
    <template #cell-summary="{ row }">
      <Stack gap="xs" class="py-3">
        <Inline gap="sm" align="center">
          <Text
            as="span"
            size="sm"
            :tone="row.reverted ? 'muted' : undefined"
            :class="row.reverted ? 'line-through' : undefined"
          >
            {{ row.summary }}
          </Text>
          <Tag v-if="row.reverted" tone="neutral">已撤销</Tag>
        </Inline>
        <Text v-if="row.note" as="span" size="xs" tone="muted">{{ row.note }}</Text>
        <Text v-if="row.edits.length > 1" as="span" size="xs" tone="muted">
          {{ row.edits.length }} 次编辑在同一批次中完成
        </Text>
      </Stack>
    </template>
    <template #cell-actions="{ row, index }">
      <CreatorEntryHistoryActions
        :row="row"
        :latest="page === 1 && index === 0"
        class="py-3"
        @changed="$emit('changed')"
      />
    </template>
  </CreatorDataTable>
</template>
