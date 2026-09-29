<script setup lang="ts">
  import {
    Button,
    DataTable,
    IconButton,
    Inline,
    SearchInput,
    Tag,
    Text,
    type DataTableColumn,
  } from '@hina-ui/vue'
  import { Pencil, Plus, Trash2 } from '@lucide/vue'
  import type { BackendNovelTerm } from '~/features/workbench/workbench'

  defineProps<{ lightNovelId: number; terms: BackendNovelTerm[]; editable: boolean }>()
  const emit = defineEmits<{ changed: [] }>()

  const { confirm } = useHikariConfirm()
  const filter = ref('')
  const formOpen = ref(false)
  const editing = ref<BackendNovelTerm | null>(null)

  const columns: DataTableColumn<BackendNovelTerm>[] = [
    { key: 'source', label: '原文', field: 'source', sortable: true },
    { key: 'target', label: '译法', field: 'target' },
    { key: 'kind', label: '类型', filterable: false },
    { key: 'actions', label: '', filterable: false },
  ]

  function openForm(term: BackendNovelTerm | null) {
    editing.value = term
    formOpen.value = true
  }

  function confirmRemove(term: BackendNovelTerm) {
    confirm({
      title: '删除术语',
      description: `删除「${term.source}」？`,
      confirmText: '删除',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: async () => {
        await hikariRequest('/api/v3/novel-terms/{term_id}', {
          method: 'delete',
          path: { term_id: term.id },
        })
        emit('changed')
      },
    })
  }
</script>

<template>
  <DataTable
    v-model:filter="filter"
    :rows="terms"
    :columns="columns"
    row-key="id"
    label="术语表"
    empty-text="还没有术语"
    variant="secondary"
  >
    <template #toolbar>
      <Inline gap="sm" align="center" justify="between" :wrap="false" class="w-full">
        <SearchInput v-model="filter" placeholder="搜索原文或译法" class="max-w-xs" />
        <Button v-if="editable" size="sm" variant="soft" @click="openForm(null)">
          <template #icon><Plus /></template>
          新增术语
        </Button>
      </Inline>
    </template>
    <template #cell-source="{ row }">
      <Text
        v-tooltip="row.note || null"
        size="sm"
        :class="cn(row.note && 'underline decoration-dotted underline-offset-4')"
      >
        {{ row.source }}
      </Text>
    </template>
    <template #cell-kind="{ row }">
      <Tag v-if="row.forbidden" size="sm" tone="danger">禁用</Tag>
      <Tag v-else-if="row.character_id" size="sm" tone="info">角色</Tag>
      <Tag v-else size="sm" tone="neutral">通用</Tag>
    </template>
    <template #cell-actions="{ row }">
      <Inline v-if="editable" gap="none" justify="end">
        <IconButton label="修改术语" variant="ghost" size="sm" @click="openForm(row)">
          <Pencil />
        </IconButton>
        <IconButton
          label="删除术语"
          variant="ghost"
          tone="danger"
          size="sm"
          @click="confirmRemove(row)"
        >
          <Trash2 />
        </IconButton>
      </Inline>
    </template>
  </DataTable>

  <WorkbenchGlossaryFormDialog
    v-model:visible="formOpen"
    :light-novel-id="lightNovelId"
    :term="editing"
    @saved="emit('changed')"
  />
</template>
