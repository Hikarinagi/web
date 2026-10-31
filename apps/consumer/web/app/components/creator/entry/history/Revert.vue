<script setup lang="ts">
  import { Button, Dialog, Inline, Input, Skeleton, Stack, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import type {
    BackendEntryProperty,
    BackendHistoryRow,
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import { statementText } from '~/features/creator/entry/values'
  import { revisionTime } from '~/features/entry/time'

  defineOptions({ name: 'CreatorEntryHistoryRevert' })
  const props = defineProps<{
    row: BackendHistoryRow
    entryId: number
    definitions: BackendPropertyDefinition[]
  }>()
  const emit = defineEmits<{ changed: [] }>()
  const open = defineModel<boolean>('open', { required: true })

  type Comparison = ApiData<'/api/v3/wiki/entries/{id}/comparison', 'get'>
  const comparison = ref<Comparison | null>(null)
  const note = ref('')
  const submitting = ref(false)
  const label = (property: string) =>
    props.definitions.find(item => item.property === property)?.label ?? property
  const textOf = (property: BackendEntryProperty, statement: Record<string, unknown> | null) => {
    if (!statement) return null
    const target = comparison.value?.entries.find(item => item.id === statement.target_id)
    return statementText({
      ...(statement as Partial<BackendStatement>),
      property,
      target: target ?? null,
      date: typeof statement.date === 'string' ? statement.date.slice(0, 10) : null,
    })
  }
  const changes = computed(() =>
    (comparison.value?.properties ?? []).flatMap(change =>
      change.statements.map((statement, index) => {
        const before = textOf(change.property, statement.before)
        const after = textOf(change.property, statement.after)
        const verb = before === null ? '删除' : after === null ? '恢复' : '改回'
        const value = before === null ? after : after === null ? before : `${after} → ${before}`
        return {
          key: `${change.property}:${index}`,
          text: `${verb}${label(change.property)}：${value}`,
        }
      }),
    ),
  )

  watch(open, async next => {
    if (!next || props.row.revision === null) return
    note.value = ''
    comparison.value = null
    comparison.value = await hikariRequest('/api/v3/wiki/entries/{id}/comparison', {
      path: { id: props.entryId },
      query: { from: props.row.revision - 1, to: props.row.revision },
    })
  })

  async function submit() {
    const edit = props.row.edits[0]
    if (!edit) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/wiki/edits/{id}/revert', {
        method: 'POST',
        path: { id: edit.id },
        body: note.value.trim() ? { note: note.value.trim() } : {},
      })
      open.value = false
      emit('changed')
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" title="撤销这次修订" size="md" :locked="submitting">
    <template #content>
      <Stack gap="md">
        <Inline gap="sm" align="center">
          <Avatar :user="row.editor" class="size-6!" />
          <UserName :user="row.editor" class="text-sm" />
          <Text as="span" size="sm" tone="muted">{{ revisionTime(row.created_at) }}</Text>
        </Inline>
        <Stack gap="xs">
          <Text as="span" size="sm" weight="medium">撤销后将</Text>
          <Skeleton v-if="!comparison" class="h-10 w-full" />
          <Text v-for="change in changes" :key="change.key" as="p" size="sm" lang="ja">
            {{ change.text }}
          </Text>
        </Stack>
        <Stack gap="xs">
          <Text as="span" size="sm" weight="medium">编辑摘要</Text>
          <Inline gap="xs" align="center" wrap>
            <Text as="span" size="sm" tone="muted">撤销</Text>
            <Avatar :user="row.editor" class="size-5!" />
            <UserName :user="row.editor" class="text-sm" />
            <Text as="span" size="sm" tone="muted" lang="ja">的修订：{{ row.summary }}</Text>
          </Inline>
          <Input
            v-model="note"
            variant="secondary"
            size="sm"
            placeholder="补充说明（可选）"
            aria-label="补充说明"
          />
        </Stack>
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button tone="danger" :loading="submitting" @click="submit">撤销</Button>
    </template>
  </Dialog>
</template>
