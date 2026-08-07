<script setup lang="ts">
  import Form, { type FormSubmitEvent } from '@primevue/forms/form'
  import { SquarePen } from '@lucide/vue'
  import { canImport, type ImportType } from '~/features/creator/editor/import'
  import {
    EDITOR_RESOURCE_OPTIONS,
    editorLaunchInitialValues,
    editorLaunchResolver,
    editorNewResolver,
    type EditorLaunchValues,
    type EditorNewValues,
  } from '~/features/creator/schemas/editor-launch.schema'

  const mode = ref<'create' | 'edit'>('create')
  const MODE_OPTIONS = [
    { label: '新建条目', value: 'create' },
    { label: '编辑现有', value: 'edit' },
  ]

  function submitNew(event: FormSubmitEvent) {
    if (!event.valid) return
    const values = event.values as EditorNewValues
    void navigateTo(`/create/new/${values.resource_type}`)
  }

  function submitEdit(event: FormSubmitEvent) {
    if (!event.valid) return
    const values = event.values as EditorLaunchValues
    void navigateTo(`/create/edit/${values.resource_type}/${values.resource_id}`)
  }
</script>

<template>
  <CardPanel
    title="发起编辑"
    :icon="SquarePen"
    description="新建一个条目，或对已存在的条目发起变更请求"
  >
    <div class="flex flex-col gap-5">
      <SelectButton
        v-model="mode"
        :options="MODE_OPTIONS"
        option-label="label"
        option-value="value"
        :allow-empty="false"
      />

      <Form
        v-if="mode === 'create'"
        v-slot="$form"
        :initial-values="{ resource_type: 'galgame' }"
        :resolver="editorNewResolver"
        class="flex flex-col gap-5"
        @submit="submitNew"
      >
        <FormItem v-slot="{ id, errorId }" name="resource_type" label="条目类型" required>
          <Select
            :input-id="id"
            :aria-describedby="errorId"
            :options="EDITOR_RESOURCE_OPTIONS"
            option-label="label"
            option-value="value"
            fluid
          />
        </FormItem>
        <Button label="新建并打开编辑器" type="submit" />

        <template v-if="canImport($form.resource_type?.value)">
          <Divider>
            <span class="text-muted-color">或从外部数据源导入</span>
          </Divider>
          <CreatorEditorImportPanel :type="$form.resource_type?.value as ImportType" />
        </template>
      </Form>

      <Form
        v-else
        :initial-values="editorLaunchInitialValues"
        :resolver="editorLaunchResolver"
        class="flex flex-col gap-5"
        @submit="submitEdit"
      >
        <FormItem v-slot="{ id, errorId }" name="resource_type" label="条目类型" required>
          <Select
            :input-id="id"
            :aria-describedby="errorId"
            :options="EDITOR_RESOURCE_OPTIONS"
            option-label="label"
            option-value="value"
            fluid
          />
        </FormItem>
        <FormItem v-slot="{ id, errorId }" name="resource_id" label="条目 ID" required>
          <InputNumber
            :input-id="id"
            :aria-describedby="errorId"
            :min="1"
            :use-grouping="false"
            placeholder="输入数字 ID"
            fluid
          />
        </FormItem>
        <Button label="打开编辑器" type="submit" />
      </Form>
    </div>
  </CardPanel>
</template>
