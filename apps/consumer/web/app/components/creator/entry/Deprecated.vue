<script setup lang="ts">
  import {
    Button,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DisclosureIcon,
    Inline,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import type { BackendStatement } from '~/features/creator/entry/contract'
  import { statementText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryDeprecated' })
  const props = defineProps<{
    entry: { id: number; revision: number }
    statements: BackendStatement[]
  }>()
  const emit = defineEmits<{ saved: [] }>()

  const REASONS: Record<string, string> = {
    CONTRADICTED: '与一手来源矛盾',
    WRONG_ENTRY: '不属于该条目',
    DUPLICATE: '与另一值重复',
    RESCHEDULED: '发售已改期',
    BAD_SOURCE: '该来源无法使用',
    REVERTED: '该次编辑已撤销',
  }
  const restoring = ref<number | null>(null)

  async function restore(statement: BackendStatement) {
    restoring.value = statement.id
    try {
      await hikariRequest('/api/v3/wiki/edits', {
        method: 'POST',
        body: {
          operations: [{ op: 'restore', statement: statement.id }],
          base: [{ entry_id: props.entry.id, revision: props.entry.revision }],
        },
      })
      emit('saved')
    } finally {
      restoring.value = null
    }
  }
</script>

<template>
  <Collapsible>
    <CollapsibleTrigger as-child>
      <Button variant="ghost" tone="neutral" size="xs" class="self-start">
        <template #trailing><DisclosureIcon /></template>
        {{ statements.length }} 个已作废的值
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <Stack gap="sm" class="pt-2">
        <Inline
          v-for="statement in statements"
          :key="statement.id"
          gap="md"
          align="center"
          justify="between"
          :wrap="false"
          class="rounded-md bg-subtle px-3 py-2"
        >
          <Stack gap="none" class="min-w-0">
            <Text as="span" size="sm" tone="muted" class="line-through">{{
              statementText(statement)
            }}</Text>
            <Text v-if="statement.deprecation_reason" as="span" size="xs" tone="muted">
              {{ REASONS[statement.deprecation_reason] ?? statement.deprecation_reason
              }}<template v-if="statement.deprecation_note"
                >。说明：{{ statement.deprecation_note }}</template
              >
            </Text>
          </Stack>
          <Button
            variant="ghost"
            tone="neutral"
            size="sm"
            :loading="restoring === statement.id"
            @click="restore(statement)"
          >
            恢复
          </Button>
        </Inline>
      </Stack>
    </CollapsibleContent>
  </Collapsible>
</template>
