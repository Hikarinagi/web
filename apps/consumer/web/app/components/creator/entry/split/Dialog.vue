<script setup lang="ts">
  import {
    Button,
    Checkbox,
    Dialog,
    Form,
    FormField,
    Input,
    Stack,
    Text,
    toast,
  } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import type {
    BackendEditableEntry,
    BackendEditOperation,
    BackendEntryReferenceGroup,
    BackendPropertyDefinition,
  } from '~/features/creator/entry/contract'
  import {
    structureSchema,
    type StructureValues,
  } from '~/features/creator/entry/schemas/structure.schema'
  import { statementText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntrySplitDialog' })
  const props = defineProps<{
    entry: BackendEditableEntry
    definitions: BackendPropertyDefinition[]
    children: BackendEntryReferenceGroup | null
  }>()
  const open = defineModel<boolean>('open', { required: true })

  const { can } = useCreatorPermissions()
  const series = computed(() => props.children?.property === 'SERIES')
  const label = (property: string) =>
    props.definitions.find(item => item.property === property)?.label ?? property
  const statements = computed(() =>
    props.entry.statements
      .filter(item => item.status !== 'DEPRECATED')
      .sort((a, b) => a.property.localeCompare(b.property) || a.position - b.position),
  )
  const picked = ref<number[]>([])
  const moving = ref<number[]>([])
  const submitting = ref(false)
  const values = reactive<StructureValues>({ note: '' })
  const form = useTemplateRef<InstanceType<typeof Form>>('form')

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    picked.value = []
    moving.value = []
    Object.assign(values, { note: '' })
  })
  const toggle = (list: number[], id: number, on: boolean) =>
    on ? [...list, id] : list.filter(item => item !== id)

  async function onSubmit() {
    if (!picked.value.length) return
    const children = props.children?.items.filter(item => moving.value.includes(item.statement_id))
    const operations: BackendEditOperation[] = [
      { op: 'split', from: props.entry.id, ref: 'n', statements: picked.value },
      ...(children ?? []).map(item =>
        series.value
          ? ({ op: 'move', statement: item.statement_id, target_ref: 'n' } as const)
          : ({
              op: 'modify',
              statement: item.statement_id,
              value: { target_ref: 'n', code: item.code },
            } as const),
      ),
    ]
    submitting.value = true
    try {
      const result = await hikariRequest('/api/v3/wiki/edits', {
        method: 'POST',
        body: {
          operations,
          base: [{ entry_id: props.entry.id, revision: props.entry.revision }],
          note: values.note.trim(),
        },
      })
      open.value = false
      if (result.status === 'APPLIED') {
        toast.success('条目已拆分')
        const created = Math.max(...result.entries)
        await navigateTo(`/create/edit/entry/${created}`)
      } else toast.success('已提出；48 小时后生效，除非有人反对')
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" title="拆分条目" size="lg" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="structureSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="lg">
          <Stack gap="sm">
            <Text as="span" size="sm" weight="medium">移至新条目的值</Text>
            <Checkbox
              v-for="statement in statements"
              :key="statement.id"
              :model-value="picked.includes(statement.id)"
              :label="`${label(statement.property)}：${statementText(statement)}`"
              @update:model-value="value => (picked = toggle(picked, statement.id, value === true))"
            />
          </Stack>
          <Stack v-if="children?.items.length" gap="sm">
            <Text as="span" size="sm" weight="medium">
              {{ series ? '移至新系列的卷' : '移至新游戏的发行版本' }}
            </Text>
            <Checkbox
              v-for="item in children.items"
              :key="item.statement_id"
              :model-value="moving.includes(item.statement_id)"
              :label="item.entry.label"
              @update:model-value="
                value => (moving = toggle(moving, item.statement_id, value === true))
              "
            />
          </Stack>
          <FormField name="note" label="拆分条目的原因" required>
            <Input v-model="values.note" placeholder="例如，品牌将两个发行版本列为各自独立的游戏" />
          </FormField>
        </Stack>
      </Form>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button :loading="submitting" :disabled="!picked.length" @click="form?.submit()">
        {{ can(WIKI_PERMISSIONS.PATROL) ? '拆分' : '提出，公示 48 小时' }}
      </Button>
    </template>
  </Dialog>
</template>
