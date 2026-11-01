<script setup lang="ts">
  import { Button, Card, Empty, Grid, Inline, Stack, Text } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { EntryComparisonPageData } from '~~/server/api/pages/create/edit/entry/[id]/compare.get'
  import type { BackendEntryProperty, BackendStatement } from '~/features/creator/entry/contract'
  import { statementText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryComparison' })
  const props = defineProps<{ pageData: EntryComparisonPageData }>()

  const labels = computed(
    () =>
      new Map(
        (
          props.pageData.definitions.find(item => item.type === props.pageData.entry.type)
            ?.properties ?? []
        ).map(item => [item.property, item.label]),
      ),
  )
  const textOf = (property: BackendEntryProperty, statement: Record<string, unknown> | null) => {
    if (!statement) return null
    const target = props.pageData.comparison.entries.find(item => item.id === statement.target_id)
    const text = statementText({
      ...(statement as Partial<BackendStatement>),
      property,
      target: target ?? null,
      date: typeof statement.date === 'string' ? statement.date.slice(0, 10) : null,
    })
    return statement.status === 'DEPRECATED' ? `${text}（已作废）` : text
  }
  const rows = computed(() => {
    const { comparison } = props.pageData
    const named = comparison.label
      ? [
          {
            key: 'label',
            label: '名称',
            before: comparison.label.before,
            after: comparison.label.after,
          },
        ]
      : []
    return [
      ...named.map(row => ({ ...row, before: String(row.before), after: String(row.after) })),
      ...comparison.properties.flatMap(change =>
        change.statements.map((statement, index) => ({
          key: `${change.property}:${index}`,
          label: labels.value.get(change.property) ?? change.property,
          before: textOf(change.property, statement.before),
          after: textOf(change.property, statement.after),
        })),
      ),
    ]
  })
</script>

<template>
  <Stack gap="lg">
    <Inline gap="md" align="center" justify="between">
      <Text as="p" size="sm" tone="muted" lang="ja">{{ pageData.entry.label }}</Text>
      <Button
        :as="NuxtLink"
        :to="`/create/edit/entry/${pageData.entry.id}/history`"
        variant="outline"
        tone="neutral"
        size="sm"
      >
        <template #icon><ArrowLeft /></template>
        返回历史
      </Button>
    </Inline>
    <Card :padded="false" class="overflow-hidden">
      <Grid :cols="2" gap="none" class="divide-x divide-line border-b border-line bg-subtle">
        <Text size="sm" weight="semibold" class="px-4 py-3">
          之前：第 {{ pageData.comparison.from }} 次修订
        </Text>
        <Text size="sm" weight="semibold" class="px-4 py-3">
          之后：第 {{ pageData.comparison.to }} 次修订
        </Text>
      </Grid>
      <Empty v-if="!rows.length" size="sm" title="两条修订的内容相同" />
      <Grid
        v-for="row in rows"
        :key="row.key"
        :cols="2"
        gap="none"
        class="divide-x divide-line border-b border-line text-sm last:border-b-0"
      >
        <Inline
          v-for="(side, index) in [row.before, row.after]"
          :key="index"
          gap="md"
          align="start"
          :wrap="false"
          class="px-4 py-2"
        >
          <Text as="span" size="sm" tone="muted" class="w-20 shrink-0">{{ row.label }}</Text>
          <Text v-if="side === null" as="span" tone="faint">—</Text>
          <Stack v-else gap="xs" class="min-w-0">
            <Text
              as="span"
              size="sm"
              lang="ja"
              :class="
                row.before === row.after
                  ? undefined
                  : index
                    ? 'rounded-xs bg-success-soft px-1 text-success-text'
                    : 'rounded-xs bg-danger-soft px-1 text-danger-text line-through'
              "
            >
              {{ side }}
            </Text>
            <Text v-if="row.before === row.after && index" as="span" size="xs" tone="muted">
              来源、限定或位置有变化
            </Text>
          </Stack>
        </Inline>
      </Grid>
    </Card>
  </Stack>
</template>
