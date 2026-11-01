<script setup lang="ts">
  import { Inline, Link, Stack, Tag, Text, type DataTableColumn } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { revisionTime } from '~/features/entry/time'

  defineOptions({ name: 'CreatorChangesTable' })
  const props = defineProps<{
    list: ApiData<'/api/v3/wiki/changes', 'get'>
    title: string
    emptyText: string
    loading: boolean
    actions?: boolean
  }>()
  defineEmits<{ changed: [] }>()
  const page = defineModel<number>('page', { required: true })

  type Row = ApiData<'/api/v3/wiki/changes', 'get'>['items'][number]
  const columns = computed<DataTableColumn<Row>[]>(() => [
    { key: 'time', label: '时间' },
    { key: 'entry', label: '条目' },
    { key: 'editor', label: '编辑者' },
    { key: 'summary', label: '编辑摘要' },
    ...(props.actions ? [{ key: 'actions', label: '操作' }] : []),
  ])

  function open(row: Row) {
    const entry = row.entries[0]
    if (entry) void navigateTo(`/create/edit/entry/${entry.id}`)
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    :title="title"
    :list="list"
    :columns="columns"
    :loading="loading"
    :count="list.meta.total_items"
    :empty-text="emptyText"
    @row-click="open"
  >
    <template v-if="$slots.filter" #filter><slot name="filter" /></template>
    <template #cell-time="{ row }">
      <Text as="span" size="sm" tone="muted" class="py-3 whitespace-nowrap">
        {{ revisionTime(row.created_at) }}
      </Text>
    </template>
    <template #cell-entry="{ row }">
      <Stack gap="none" class="py-3">
        <Link
          v-for="entry in row.entries.slice(0, 3)"
          :key="entry.id"
          :as="NuxtLink"
          :to="`/create/edit/entry/${entry.id}`"
          tone="accent"
          class="text-sm"
          lang="ja"
          @click.stop
        >
          {{ entry.label }}
        </Link>
        <Text v-if="row.entries.length > 3" as="span" size="xs" tone="muted">
          另有 {{ row.entries.length - 3 }} 个条目
        </Text>
      </Stack>
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
            :tone="row.reverted_at ? 'muted' : undefined"
            :class="row.reverted_at ? 'line-through' : undefined"
          >
            {{ row.summary }}
          </Text>
          <Tag v-if="row.reverted_at" tone="neutral">已撤销</Tag>
          <Tag v-else-if="row.patrolled_at" tone="success">已巡查</Tag>
        </Inline>
        <Text v-if="row.note" as="span" size="xs" tone="muted">{{ row.note }}</Text>
        <Text v-if="row.status === 'PENDING' && row.effective_at" as="span" size="xs" tone="muted">
          {{ revisionTime(row.effective_at) }} 生效
        </Text>
        <Text v-if="row.objection_count" as="span" size="xs" tone="warning">
          {{ row.objection_count }} 条反对；暂缓执行，待巡查者决定
        </Text>
      </Stack>
    </template>
    <template v-if="actions" #cell-actions="{ row }">
      <slot name="row-actions" :row="row">
        <CreatorChangesActions :row="row" class="py-3" @changed="$emit('changed')" />
      </slot>
    </template>
  </CreatorDataTable>
</template>
