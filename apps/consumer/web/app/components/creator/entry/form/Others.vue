<script setup lang="ts">
  import { Checkbox, Stack, Text } from '@hina-ui/vue'
  import {
    ENTRY_PROPERTIES,
    type BackendEditOperation,
    type BackendPropertyDefinition,
    type BackendSource,
  } from '~/features/creator/entry/contract'
  import { statementText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryFormOthers' })
  const props = defineProps<{
    entry: { id: number; type: string }
    definition: BackendPropertyDefinition
    source: BackendSource | null
    citations: Record<string, unknown>[]
  }>()
  const operations = defineModel<BackendEditOperation[]>({ required: true })

  const scope = inject(ENTRY_PROPERTIES, null)
  const items = computed(() => {
    const source = props.source
    if (!source?.record_key || !scope) return []
    return source.values.flatMap(item => {
      if (item.entry_type !== props.entry.type || item.property === props.definition.property)
        return []
      const definition = scope.value.definitions.find(entry => entry.property === item.property)
      if (!definition) return []
      const live = scope.value.statements.filter(
        statement => statement.property === item.property && statement.status !== 'DEPRECATED',
      )
      const next = statementText({ ...item.value, property: item.property, target: null })
      const same = live.find(statement => statementText(statement) === next)
      const current = live[0] ?? null
      const citations = props.citations as never
      const qualifiers = item.qualifiers ? { qualifiers: item.qualifiers } : {}
      const operation: BackendEditOperation = same
        ? { op: 'cite', statement: same.id, citations }
        : current && definition.cardinality !== 'multiple'
          ? { op: 'modify', statement: current.id, value: item.value, citations, ...qualifiers }
          : {
              op: 'add',
              entry: props.entry.id,
              property: item.property,
              value: item.value,
              citations,
              ...qualifiers,
            }
      return [
        {
          key: item.property,
          label: definition.label,
          next,
          now:
            same || definition.cardinality === 'multiple' || !current
              ? null
              : statementText(current),
          same: Boolean(same),
          operation,
        },
      ]
    })
  })
  const picked = ref<string[]>([])
  watch(
    () => items.value.map(item => item.key).join(),
    () => (picked.value = items.value.map(item => item.key)),
    { immediate: true },
  )
  watchEffect(() => {
    operations.value = items.value
      .filter(item => picked.value.includes(item.key))
      .map(item => item.operation)
  })
</script>

<template>
  <Stack v-if="items.length" gap="sm">
    <Text as="span" size="sm" weight="medium">同一来源中的其他 {{ items.length }} 项</Text>
    <Checkbox
      v-for="item in items"
      :key="item.key"
      :model-value="picked.includes(item.key)"
      @update:model-value="
        value =>
          (picked = value === true ? [...picked, item.key] : picked.filter(key => key !== item.key))
      "
    >
      {{ item.label }}：{{ item.next }}
      <Text as="span" size="sm" tone="muted">
        {{ item.same ? '（与现值相同）' : item.now ? `（现值 ${item.now}）` : '（新增）' }}
      </Text>
    </Checkbox>
  </Stack>
</template>
