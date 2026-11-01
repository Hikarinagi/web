<script setup lang="ts">
  import { Link, Stack, Text, type DataTableColumn } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { CreatorTodosPageData } from '~~/server/api/pages/create/todos.get'
  import { todoText } from '~/features/creator/entry/todos'
  import { revisionTime } from '~/features/entry/time'

  defineOptions({ name: 'CreatorTodosTable' })
  const props = defineProps<{ pageData: CreatorTodosPageData; loading: boolean }>()
  defineEmits<{ changed: [] }>()
  const page = defineModel<number>('page', { required: true })
  const kind = defineModel<string>('kind', { required: true })
  const section = defineModel<string>('section', { required: true })
  const type = defineModel<string>('type', { required: true })

  type Row = CreatorTodosPageData['todos']['items'][number]
  const columns: DataTableColumn<Row>[] = [
    { key: 'todo', label: '待完善事项' },
    { key: 'entry', label: '条目' },
    { key: 'raised', label: '提出时间' },
    { key: 'actions', label: '操作' },
  ]
  const types = computed(() =>
    props.pageData.definitions.map(item => ({ value: item.type, label: item.label })),
  )
  const text = (row: Row) =>
    todoText(
      row,
      [],
      props.pageData.definitions.find(item => item.type === row.entries[0]?.type)?.properties ?? [],
    )

  function open(row: Row) {
    const entry = row.entries[0]
    if (entry) void navigateTo(`/create/edit/entry/${entry.id}`)
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="待完善"
    :list="pageData.todos"
    :columns="columns"
    :loading="loading"
    :count="pageData.todos.meta.total_items"
    empty-text="没有符合筛选条件的待完善事项"
    @row-click="open"
  >
    <template #filter>
      <CreatorTodosFilters
        v-model:kind="kind"
        v-model:section="section"
        v-model:type="type"
        :types="types"
      />
    </template>
    <template #cell-todo="{ row }">
      <Text as="p" size="sm" class="py-3">{{ text(row) }}</Text>
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
    <template #cell-raised="{ row }">
      <Text as="span" size="sm" tone="muted" class="py-3 whitespace-nowrap">
        {{ revisionTime(row.created_at) }}
      </Text>
    </template>
    <template #cell-actions="{ row }">
      <CreatorTodosActions :todo="row" class="py-3" @changed="$emit('changed')" />
    </template>
  </CreatorDataTable>
</template>
