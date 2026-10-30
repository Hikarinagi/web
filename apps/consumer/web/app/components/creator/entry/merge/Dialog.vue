<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input, RadioGroup, Stack, toast } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import type {
    BackendEditableEntry,
    BackendMergePreview,
    BackendPropertyDefinition,
  } from '~/features/creator/entry/contract'
  import { mergeSchema, type MergeValues } from '~/features/creator/entry/schemas/merge.schema'

  defineOptions({ name: 'CreatorEntryMergeDialog' })
  const props = defineProps<{
    entry: BackendEditableEntry
    definitions: BackendPropertyDefinition[]
  }>()
  const open = defineModel<boolean>('open', { required: true })

  const KEEP = [
    { value: 'this', label: '保留本条目' },
    { value: 'other', label: '保留所选条目' },
  ]
  const { can } = useCreatorPermissions()
  const target = ref<number | null>(null)
  const keep = ref<'this' | 'other'>('this')
  const step = ref<'pick' | 'review'>('pick')
  const other = ref<BackendEditableEntry | null>(null)
  const preview = ref<BackendMergePreview | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const values = reactive<MergeValues>({ note: '' })
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const from = computed(() => (keep.value === 'this' ? other.value : props.entry))
  const into = computed(() => (keep.value === 'this' ? props.entry : other.value))

  watch(open, next => {
    if (!next) return
    Object.assign(values, { note: '' })
    target.value = null
    step.value = 'pick'
  })

  async function next() {
    if (target.value === null) return
    loading.value = true
    try {
      other.value = await hikariRequest('/api/v3/wiki/entries/{id}', {
        path: { id: target.value },
      })
      if (!from.value || !into.value) return
      preview.value = await hikariRequest('/api/v3/wiki/entries/{id}/merge-preview', {
        path: { id: from.value.id },
        query: { into: into.value.id },
      })
      step.value = 'review'
    } finally {
      loading.value = false
    }
  }

  async function onSubmit() {
    if (!from.value || !into.value || !preview.value) return
    submitting.value = true
    try {
      const result = await hikariRequest('/api/v3/wiki/edits', {
        method: 'POST',
        body: {
          operations: preview.value.operations,
          base: [from.value, into.value].map(item => ({
            entry_id: item.id,
            revision: item.revision,
          })),
          note: values.note.trim(),
        },
      })
      open.value = false
      if (result.status === 'APPLIED') {
        toast.success('已合并')
        await navigateTo(`/create/edit/entry/${into.value.id}`)
      } else toast.success('已提出；48 小时后生效，除非有人反对')
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" title="合并重复条目" size="lg" :locked="submitting || loading">
    <template #content>
      <Stack v-if="step === 'pick'" gap="md">
        <FormField name="target" label="与本条目重复的条目" required>
          <CreatorEntryFormTarget v-model="target" :types="[entry.type]" :exclude="entry.id" />
        </FormField>
        <FormField name="keep" label="保留的条目">
          <RadioGroup v-model="keep" :options="KEEP" />
        </FormField>
      </Stack>
      <Stack v-else-if="from && into && preview" gap="lg">
        <CreatorEntryMergeReview
          :from="from"
          :into="into"
          :preview="preview"
          :definitions="definitions"
        />
        <Form
          ref="form"
          :values="values"
          :rules="mergeSchema"
          :disabled="submitting"
          @submit="onSubmit"
        >
          <Stack gap="md">
            <FormField name="note" label="为何视为相同" required>
              <Input v-model="values.note" placeholder="例如，两者在品牌站点上列出了相同的 JAN" />
            </FormField>
          </Stack>
        </Form>
      </Stack>
    </template>
    <template #footer>
      <template v-if="step === 'pick'">
        <Button variant="ghost" tone="neutral" @click="open = false">取消</Button>
        <Button :loading="loading" :disabled="target === null" @click="next">下一步</Button>
      </template>
      <template v-else>
        <Button variant="ghost" tone="neutral" :disabled="submitting" @click="step = 'pick'">
          返回
        </Button>
        <Button :loading="submitting" @click="form?.submit()">
          {{ can(WIKI_PERMISSIONS.PATROL) ? '合并' : '提出，公示 48 小时' }}
        </Button>
      </template>
    </template>
  </Dialog>
</template>
