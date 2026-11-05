<script setup lang="ts">
  import { Button, Inline, Stack, Text } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EntryStatement, PropertyDefinition } from '~/features/wiki/editor/draft'
  import { DEPRECATION_REASONS, qualifierText, valueText } from '~/features/wiki/values'

  defineOptions({ name: 'WikiFieldDeleted' })

  const props = defineProps<{
    items: EntryStatement[]
    definition: PropertyDefinition
    entry: number
  }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const router = useRouter()
  const key = computed(() => `${props.entry}|${props.definition.property}`)
  const open = computed(() => route.query.gone === key.value)

  function toggle() {
    const { gone: _gone, ...query } = route.query
    void router.replace({ query: open.value ? query : { ...query, gone: key.value } })
  }

  const describe = (statement: EntryStatement) => {
    const qualifier = qualifierText(statement)
    return `${valueText(statement)}${qualifier ? `（${qualifier}）` : ''}`
  }
</script>

<template>
  <Stack gap="xs">
    <Button variant="link" size="sm" class="self-start" @click="toggle">
      {{ open ? '收起已删除的值' : `已删除的值（${items.length}）` }}
    </Button>
    <Stack v-if="open" gap="xs">
      <Inline v-for="item in items" :key="item.id" gap="sm" align="baseline" :wrap="false">
        <Text as="span" size="sm" tone="muted" class="min-w-0 line-through" truncate>
          {{ describe(item) || '空' }}
        </Text>
        <Text v-if="item.deprecation_reason" as="span" size="xs" tone="faint" class="shrink-0">
          {{ DEPRECATION_REASONS[item.deprecation_reason] }}
        </Text>
        <Button variant="link" size="sm" class="shrink-0" @click="editor.restore(item.id)"
          >恢复</Button
        >
      </Inline>
    </Stack>
  </Stack>
</template>
