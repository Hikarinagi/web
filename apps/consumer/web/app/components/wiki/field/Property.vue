<script setup lang="ts">
  import { Button, Flex, Inline, Stack, Text } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { emptyValue, type PropertyDefinition } from '~/features/wiki/editor/draft'
  import type { QualifierKind } from '~/features/wiki/editor/inputs'

  defineOptions({ name: 'WikiFieldProperty' })

  const props = defineProps<{ entry: number; definition: PropertyDefinition }>()
  const editor = inject(ENTRY_EDITOR)!

  const view = computed(() => editor.property(props.entry, props.definition.property))
  const live = computed(() =>
    view.value.values.filter(item => item.state !== 'removed' && item.state !== 'moved_out'),
  )
  const addable = computed(
    () =>
      !props.definition.move_only &&
      (props.definition.cardinality !== 'single' || !live.value.length),
  )
  const opened = ref<Record<number, QualifierKind[]>>({})
  const repeated = computed(() => {
    if (props.definition.shape !== 'credit') return new Set<number>()
    const key = (value: (typeof live.value)[number]['value']) =>
      `${value.code ?? ''}|${value.target?.id ?? (value.text ?? '').trim()}|${value.part ?? ''}`
    const seen = new Map<string, number[]>()
    for (const item of live.value)
      seen.set(key(item.value), [...(seen.get(key(item.value)) ?? []), item.id])
    return new Set([...seen.values()].filter(ids => ids.length > 1).flat())
  })

  function add() {
    const qualifiers = props.definition.qualifiers as QualifierKind[]
    const open: QualifierKind[] = live.value.length
      ? qualifiers.filter(kind => kind === 'period' || kind === 'version')
      : []
    const codes = props.definition.codes ?? []
    const id = editor.add(props.entry, props.definition.property, {
      ...emptyValue(),
      ...(props.definition.shape === 'credit' && codes.length === 1 ? { code: codes[0] } : {}),
    })
    opened.value = { ...opened.value, [id]: open }
  }
</script>

<template>
  <Flex gap="md" align="start" class="max-md:flex-col max-md:gap-1">
    <Inline gap="xs" align="center" :wrap="false" class="w-32 shrink-0 pt-1.5">
      <Text size="sm" tone="muted">{{ definition.label }}</Text>
      <WikiFieldRule
        v-if="definition.clauses.length"
        :label="definition.label"
        :clauses="definition.clauses"
      />
    </Inline>
    <Stack gap="sm" class="min-w-0 flex-1">
      <WikiFieldValue
        v-for="(item, index) in view.values"
        :key="item.id"
        :item="item"
        :entry="entry"
        :definition="definition"
        :label="definition.label"
        :up="item.id > 0 && index > 0 && (view.values[index - 1]?.id ?? 0) > 0"
        :down="item.id > 0 && (view.values[index + 1]?.id ?? 0) > 0"
        :open="opened[item.id]"
        :repeated="repeated.has(item.id)"
      />
      <Button
        v-if="addable"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="self-start"
        @click="add"
      >
        <template #icon><Plus /></template>
        添加
      </Button>
      <WikiFieldDeleted
        v-if="view.deprecated.length"
        :items="view.deprecated"
        :definition="definition"
        :entry="entry"
      />
    </Stack>
  </Flex>
</template>
