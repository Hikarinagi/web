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
  import { sourcesOf, statementText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryDeprecated' })
  const props = defineProps<{
    entry: { id: number; revision: number }
    statements: BackendStatement[]
  }>()
  const emit = defineEmits<{ saved: [] }>()

  const REASONS: Record<string, string> = {
    CONTRADICTED: '与一手来源矛盾',
    WRONG_ENTRY: '不属于本条目',
    DUPLICATE: '与其他值重复',
    RESCHEDULED: '发售已改期',
    BAD_SOURCE: '该来源无法使用',
    REVERTED: '该次编辑已撤销',
  }
  const restoring = ref<number | null>(null)
  const sources = (statement: BackendStatement) =>
    sourcesOf(statement)
      .map(citation => citation.source ?? citation.url)
      .filter(Boolean)
      .join('、')

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
        {{ statements.length }} 个作废的值
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
          <Stack gap="xs" class="min-w-0">
            <Text as="span" size="sm" lang="ja">{{ statementText(statement) }}</Text>
            <Inline gap="xs" align="center" wrap class="text-xs text-muted">
              <Text as="span" size="xs" tone="muted">
                {{ sources(statement) ? `来源：${sources(statement)}` : '没有来源' }}，已由
              </Text>
              <Avatar :user="statement.editor" class="size-4!" />
              <UserName :user="statement.editor" class="text-xs" />
              <Text as="span" size="xs" tone="muted">
                作废<template v-if="statement.deprecation_reason"
                  >（{{
                    REASONS[statement.deprecation_reason] ?? statement.deprecation_reason
                  }}）</template
                >。
              </Text>
            </Inline>
            <Text v-if="statement.deprecation_note" as="span" size="xs" tone="muted">
              说明：{{ statement.deprecation_note }}
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
