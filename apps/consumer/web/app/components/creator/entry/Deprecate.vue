<script setup lang="ts">
  import {
    Button,
    Dialog,
    Form,
    FormField,
    Input,
    RadioGroup,
    Stack,
    Text,
    Textarea,
  } from '@hina-ui/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import {
    deprecateSchema,
    type DeprecateValues,
  } from '~/features/creator/entry/schemas/deprecate.schema'
  import { statementText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryDeprecate' })
  const props = defineProps<{
    entry: { id: number; revision: number }
    definition: BackendPropertyDefinition
    statement: BackendStatement
  }>()
  const emit = defineEmits<{ saved: [] }>()
  const open = defineModel<boolean>('open', { required: true })

  const REASONS = [
    { value: 'CONTRADICTED', label: '与一手来源矛盾' },
    { value: 'WRONG_ENTRY', label: '不属于该条目' },
    { value: 'DUPLICATE', label: '与另一值重复' },
  ]
  const values = reactive<DeprecateValues>({
    reason: 'CONTRADICTED',
    source: '',
    excerpt: '',
    note: '',
  })
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const title = computed(() => `作废${props.definition.label}「${statementText(props.statement)}」`)

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    Object.assign(values, { reason: 'CONTRADICTED', source: '', excerpt: '', note: '' })
  })

  async function onSubmit() {
    submitting.value = true
    try {
      const citations =
        values.reason === 'CONTRADICTED'
          ? [
              {
                method: 'EXCERPT' as const,
                url: values.source.trim(),
                excerpt: values.excerpt.trim() || null,
              },
            ]
          : []
      await hikariRequest('/api/v3/wiki/edits', {
        method: 'POST',
        body: {
          operations: [
            {
              op: 'deprecate',
              statement: props.statement.id,
              reason: values.reason,
              ...(values.note.trim() ? { note: values.note.trim() } : {}),
              citations,
            },
          ],
          base: [{ entry_id: props.entry.id, revision: props.entry.revision }],
        },
      })
      open.value = false
      emit('saved')
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" :title="title" size="md" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="deprecateSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="md">
          <FormField name="reason" label="原因">
            <RadioGroup v-model="values.reason" :options="REASONS" />
          </FormField>
          <template v-if="values.reason === 'CONTRADICTED'">
            <FormField name="source" label="相矛盾的来源" required>
              <Input v-model="values.source" placeholder="粘贴网址、ISBN 或 JAN" />
            </FormField>
            <FormField name="excerpt" label="摘录">
              <Textarea v-model="values.excerpt" :rows="2" placeholder="复制页面上包含该值的文字" />
            </FormField>
          </template>
          <Stack gap="xs">
            <Text as="span" size="sm" weight="medium">编辑摘要</Text>
            <Text as="p" size="sm" tone="muted">{{ title }}</Text>
          </Stack>
          <FormField name="note" :required="values.reason !== 'CONTRADICTED'">
            <Input
              v-model="values.note"
              size="sm"
              :placeholder="
                values.reason === 'CONTRADICTED' ? '补充说明（可选）' : '请说明该值作废的原因'
              "
              aria-label="补充说明"
            />
          </FormField>
        </Stack>
      </Form>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false"
        >取消</Button
      >
      <Button tone="danger" :loading="submitting" @click="form?.submit()">作废</Button>
    </template>
  </Dialog>
</template>
