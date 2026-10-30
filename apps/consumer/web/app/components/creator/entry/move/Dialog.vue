<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input, Stack, toast } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import {
    structureSchema,
    type StructureValues,
  } from '~/features/creator/entry/schemas/structure.schema'

  defineOptions({ name: 'CreatorEntryMoveDialog' })
  const props = defineProps<{
    entry: { id: number; revision: number; type: string }
    definition: BackendPropertyDefinition
    statement: BackendStatement
  }>()
  const emit = defineEmits<{ saved: [] }>()
  const open = defineModel<boolean>('open', { required: true })

  const { can } = useCreatorPermissions()
  const character = computed(() => props.definition.property === 'CHARACTER')
  const target = ref<number | null>(null)
  const submitting = ref(false)
  const values = reactive<StructureValues>({ note: '' })
  const form = useTemplateRef<InstanceType<typeof Form>>('form')

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    target.value = null
    Object.assign(values, { note: '' })
  })

  async function onSubmit() {
    if (target.value === null) return
    submitting.value = true
    try {
      const result = await hikariRequest('/api/v3/wiki/edits', {
        method: 'POST',
        body: {
          operations: [{ op: 'move', statement: props.statement.id, target: target.value }],
          base: [{ entry_id: props.entry.id, revision: props.entry.revision }],
          note: values.note.trim(),
        },
      })
      open.value = false
      toast.success(result.status === 'APPLIED' ? '已移动' : '已提出；48 小时后生效，除非有人反对')
      emit('saved')
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:open="open"
    :title="character ? '归入其他角色' : '移动到其他系列'"
    size="md"
    :locked="submitting"
  >
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="structureSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="md">
          <FormField name="target" :label="character ? '归入的角色' : '移动到的系列'" required>
            <CreatorEntryFormTarget
              v-model="target"
              :types="definition.targets"
              :exclude="statement.target?.id"
            />
          </FormField>
          <FormField name="note" label="移动原因" required>
            <Input v-model="values.note" />
          </FormField>
        </Stack>
      </Form>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button :loading="submitting" :disabled="target === null" @click="form?.submit()">
        {{ can(WIKI_PERMISSIONS.PATROL) ? '移动' : '提出，公示 48 小时' }}
      </Button>
    </template>
  </Dialog>
</template>
