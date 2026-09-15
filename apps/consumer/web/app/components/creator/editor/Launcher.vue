<script setup lang="ts">
  import {
    Button,
    Divider,
    Form,
    FormField,
    NumberInput,
    Panel,
    SegmentedControl,
    Select,
    Stack,
  } from '@hina-ui/vue'
  import { SquarePen } from '@lucide/vue'
  import { canImport, type ImportType } from '~/features/creator/editor/import'
  import {
    EDITOR_RESOURCE_OPTIONS,
    editorLaunchSchema,
    editorNewSchema,
  } from '~/features/creator/schemas/editor-launch.schema'

  const MODE_OPTIONS = [
    { label: '新建条目', value: 'create' },
    { label: '编辑现有', value: 'edit' },
  ]

  const mode = ref('create')
  const newValues = reactive({ resource_type: 'galgame' })
  const editValues = reactive<{ resource_type: string; resource_id: number | null }>({
    resource_type: 'galgame',
    resource_id: null,
  })

  const importType = computed<ImportType | null>(() =>
    canImport(newValues.resource_type) ? newValues.resource_type : null,
  )

  function submitNew() {
    void navigateTo(`/create/new/${newValues.resource_type}`)
  }

  function submitEdit() {
    void navigateTo(`/create/edit/${editValues.resource_type}/${editValues.resource_id}`)
  }
</script>

<template>
  <Panel title="发起编辑" description="新建一个条目，或对已存在的条目发起变更请求">
    <template #icon><SquarePen /></template>
    <Stack gap="lg">
      <SegmentedControl v-model="mode" :options="MODE_OPTIONS" aria-label="发起方式" />

      <Form
        v-if="mode === 'create'"
        :values="newValues"
        :rules="editorNewSchema"
        @submit="submitNew"
      >
        <FormField name="resource_type" label="条目类型" required>
          <Select v-model="newValues.resource_type" :options="EDITOR_RESOURCE_OPTIONS" />
        </FormField>
        <Button type="submit">新建并打开编辑器</Button>

        <template v-if="importType">
          <Divider>或从外部数据源导入</Divider>
          <CreatorEditorImportPanel :type="importType" />
        </template>
      </Form>

      <Form v-else :values="editValues" :rules="editorLaunchSchema" @submit="submitEdit">
        <FormField name="resource_type" label="条目类型" required>
          <Select v-model="editValues.resource_type" :options="EDITOR_RESOURCE_OPTIONS" />
        </FormField>
        <FormField name="resource_id" label="条目 ID" required>
          <NumberInput
            v-model="editValues.resource_id"
            :min="1"
            :format-options="{ useGrouping: false }"
            placeholder="输入数字 ID"
          />
        </FormField>
        <Button type="submit">打开编辑器</Button>
      </Form>
    </Stack>
  </Panel>
</template>
