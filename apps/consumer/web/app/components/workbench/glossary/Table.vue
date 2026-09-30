<script setup lang="ts">
  import {
    Button,
    DataTable,
    Empty,
    IconButton,
    Inline,
    SearchInput,
    Tag,
    Text,
    type DataTableColumn,
  } from '@hina-ui/vue'
  import { Import, Pencil, Plus, Trash2 } from '@lucide/vue'
  import type { BackendNovelTerm } from '~/features/workbench/workbench'

  defineProps<{ projectId: number; terms: BackendNovelTerm[]; editable: boolean }>()
  const emit = defineEmits<{ changed: [] }>()

  const { confirm } = useHikariConfirm()
  const filter = ref('')
  const formOpen = ref(false)
  const importOpen = ref(false)
  const editing = ref<BackendNovelTerm | null>(null)

  const columns: DataTableColumn<BackendNovelTerm>[] = [
    { key: 'source', label: '原文', field: 'source', sortable: true },
    { key: 'target', label: '译法', field: 'target' },
    { key: 'kind', label: '类型', filterable: false },
    { key: 'creator', label: '创建人', filterable: false },
    { key: 'actions', label: '', filterable: false, pin: 'end' },
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
    variant="secondary"
    table-class="whitespace-nowrap"
  >
    <template #toolbar>
      <Inline gap="sm" align="center" justify="between" class="w-full">
        <SearchInput
          v-model="filter"
          placeholder="搜索原文或译法"
          class="min-w-48 flex-1 sm:max-w-xs"
        />
        <Inline v-if="editable" gap="sm" :wrap="false">
          <Button size="sm" variant="ghost" tone="neutral" @click="importOpen = true">
            <template #icon><Import /></template>
            从另一个项目导入
          </Button>
          <Button size="sm" variant="soft" @click="openForm(null)">
            <template #icon><Plus /></template>
            新增术语
          </Button>
        </Inline>
      </Inline>
    </template>
    <template v-if="!terms.length" #empty>
      <Empty
        size="sm"
        title="术语表为空"
        :description="editable ? '添加术语，或从本系列中的另一个项目导入它们。' : undefined"
      />
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
    <template #cell-creator="{ row }">
      <UserName :user="row.creator" :handle="false" class="text-sm" />
    </template>
    <template #cell-actions="{ row }">
      <Inline v-if="editable" gap="none" justify="end" :wrap="false">
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
    :project-id="projectId"
    :term="editing"
    @saved="emit('changed')"
  />
  <WorkbenchGlossaryImportDialog
    v-model:open="importOpen"
    :project-id="projectId"
    @imported="emit('changed')"
  />
</template>
