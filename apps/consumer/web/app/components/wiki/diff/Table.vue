<script setup lang="ts">
  import { Empty, Inline, Stack, Text } from '@hina-ui/vue'
  import type { RevisionComparison } from '~/features/wiki/changes'

  defineOptions({ name: 'WikiDiffTable' })

  const props = defineProps<{
    comparison: RevisionComparison
    names: Record<string, string>
    reverse?: boolean
    kept?: number[]
  }>()

  const target = (id: number | null) =>
    id === null ? '' : (props.comparison.entries.find(entry => entry.id === id)?.label ?? '')
  const groups = computed(() =>
    props.comparison.properties
      .filter(change => change.statements.length)
      .map(change => ({
        property: change.property,
        rows: change.statements.map(({ before, after }, index) => {
          const id = after?.id ?? before?.id
          return {
            key: `${change.property}-${id ?? index}`,
            before: props.reverse ? after : before,
            after: props.reverse ? before : after,
            kept: id !== undefined && Boolean(props.kept?.includes(id)),
          }
        }),
      })),
  )
  const empty = computed(
    () => !groups.value.length && !props.comparison.deleted && !props.comparison.redirect_id,
  )
</script>

<template>
  <Empty v-if="empty" title="没有内容改动" />
  <Stack v-else gap="none" align="stretch" class="divide-y divide-line">
    <Inline
      v-if="comparison.deleted"
      gap="md"
      align="start"
      :wrap="false"
      class="px-(--hn-panel-p) py-3"
    >
      <Text size="sm" tone="muted" class="w-28 shrink-0">条目</Text>
      <Text size="sm">{{ comparison.deleted.after ? '删除条目' : '恢复条目' }}</Text>
    </Inline>
    <Inline
      v-if="comparison.redirect_id"
      gap="md"
      align="start"
      :wrap="false"
      class="px-(--hn-panel-p) py-3"
    >
      <Text size="sm" tone="muted" class="w-28 shrink-0">合并到</Text>
      <WikiDiffText
        :before="target(comparison.redirect_id.before)"
        :after="target(comparison.redirect_id.after)"
      />
    </Inline>
    <Inline
      v-for="group in groups"
      :key="group.property"
      gap="md"
      align="start"
      :wrap="false"
      class="px-(--hn-panel-p) py-3"
    >
      <Text size="sm" tone="muted" class="w-28 shrink-0">{{
        names[group.property] ?? group.property
      }}</Text>
      <Stack gap="sm" class="min-w-0 flex-1">
        <WikiDiffValue
          v-for="row in group.rows"
          :key="row.key"
          :property="group.property"
          :before="row.before"
          :after="row.after"
          :kept="row.kept"
        />
      </Stack>
    </Inline>
  </Stack>
</template>
