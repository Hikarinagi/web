<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { Button, Dialog, Inline, SegmentedControl, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { valueOf, type EditableEntry, type ValueDraft } from '~/features/wiki/editor/draft'
  import { qualifierText, valueText } from '~/features/wiki/values'

  defineOptions({ name: 'WikiSaveConflict' })

  type Conflict = ApiData<'/api/v3/wiki/edits/checks', 'post'>['conflicts'][number]

  const props = defineProps<{ conflicts: Conflict[] }>()
  const emit = defineEmits<{ resolved: [] }>()
  const open = defineModel<boolean>('open', { required: true })
  const editor = inject(ENTRY_EDITOR)!

  const fresh = shallowRef<Map<number, EditableEntry>>(new Map())
  const choices = ref<Record<number, 'mine' | 'theirs'>>({})
  const OPTIONS = [
    { value: 'mine', label: '保留我的' },
    { value: 'theirs', label: '使用对方的' },
  ]

  const describe = (
    value: ValueDraft | null,
    property: EditableEntry['statements'][number]['property'],
  ) => {
    if (!value) return '已删除'
    const qualifier = qualifierText(value)
    const text = valueText({ ...value, property }) || '空'
    return qualifier ? `${text}（${qualifier}）` : text
  }
  const rows = computed(() =>
    props.conflicts.flatMap(conflict =>
      conflict.statements.flatMap(id => {
        const start = editor.statements.value.get(id)?.statement
        if (!start) return []
        const now = fresh.value.get(conflict.entry_id)?.statements.find(item => item.id === id)
        const mine =
          id in editor.draft.value.removed
            ? null
            : (editor.draft.value.changed[id] ?? valueOf(start))
        return [
          {
            id,
            entry: conflict.entry_id,
            label:
              editor.definitions.value
                .get(editor.entries.value.get(conflict.entry_id)?.type ?? 'GAME')
                ?.properties.find(item => item.property === start.property)?.label ?? '',
            editor: now?.editor ?? null,
            start: describe(valueOf(start), start.property),
            theirs: now
              ? describe(now.status === 'DEPRECATED' ? null : valueOf(now), start.property)
              : '',
            mine: describe(mine, start.property),
          },
        ]
      }),
    ),
  )

  watch(open, async next => {
    if (!next) return
    choices.value = {}
    const loaded = await Promise.all(
      props.conflicts.map(conflict =>
        hikariRequest('/api/v3/wiki/entries/{id}', { path: { id: conflict.entry_id } }),
      ),
    )
    fresh.value = new Map(loaded.map(entry => [entry.id, entry]))
  })

  function choose(id: number, value: unknown) {
    choices.value = { ...choices.value, [id]: value === 'theirs' ? 'theirs' : 'mine' }
  }

  function apply() {
    for (const row of rows.value)
      if ((choices.value[row.id] ?? 'mine') === 'theirs') editor.revert(row.id)
    for (const entry of fresh.value.values()) editor.rebase(entry.id, entry.revision)
    open.value = false
    emit('resolved')
  }
</script>

<template>
  <Dialog v-model:open="open" title="有人改过同一个值" size="md">
    <template #content>
      <Stack v-if="!fresh.size" gap="sm">
        <Skeleton class="h-16" />
      </Stack>
      <Stack v-else gap="lg">
        <Stack v-for="row in rows" :key="row.id" gap="sm">
          <Inline gap="sm" align="center" justify="between">
            <Text size="sm" weight="medium">{{ row.label }}</Text>
            <Inline v-if="row.editor" gap="xs" align="center" :wrap="false">
              <Avatar :user="row.editor" size="sm" />
              <UserName :user="row.editor" class="text-sm" />
            </Inline>
          </Inline>
          <Text size="sm" tone="muted">开始编辑时：{{ row.start }}</Text>
          <Text size="sm">对方改成：{{ row.theirs }}</Text>
          <Text size="sm">你改成：{{ row.mine }}</Text>
          <SegmentedControl
            :model-value="choices[row.id] ?? 'mine'"
            :options="OPTIONS"
            size="sm"
            class="self-start"
            @update:model-value="value => choose(row.id, value)"
          />
        </Stack>
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" @click="open = false">取消</Button>
      <Button :disabled="!fresh.size" @click="apply">继续保存</Button>
    </template>
  </Dialog>
</template>
