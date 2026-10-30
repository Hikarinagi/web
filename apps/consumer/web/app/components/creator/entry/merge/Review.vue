<script setup lang="ts">
  import {
    Card,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Heading,
    SimpleGrid,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import type {
    BackendEditableEntry,
    BackendMergePreview,
    BackendPropertyDefinition,
  } from '~/features/creator/entry/contract'
  import { movedLabel } from '~/features/creator/entry/merge'
  import { isLong, statementText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryMergeReview' })
  const props = defineProps<{
    from: BackendEditableEntry
    into: BackendEditableEntry
    preview: BackendMergePreview
    definitions: BackendPropertyDefinition[]
  }>()

  const label = (property: string) =>
    props.definitions.find(item => item.property === property)?.label ?? property
  const facts = (entry: BackendEditableEntry) =>
    props.definitions
      .filter(definition => !isLong(definition) && definition.shape !== 'rich')
      .map(definition => ({
        label: definition.label,
        values: entry.statements
          .filter(item => item.property === definition.property && item.status !== 'DEPRECATED')
          .map(statementText)
          .filter(Boolean)
          .slice(0, 3),
      }))
      .filter(item => item.values.length)
      .slice(0, 5)
  const deprecated = computed(() =>
    props.preview.operations
      .filter(operation => operation.op === 'deprecate')
      .flatMap(operation => props.from.statements.filter(item => item.id === operation.statement))
      .map(item => {
        const text = statementText(item)
        return `${label(item.property)}「${text.length > 60 ? `${text.slice(0, 60)}…` : text}」`
      }),
  )
  const moved = computed(() => {
    const totals = new Map<string, number>()
    for (const item of props.preview.moved)
      totals.set(movedLabel(item.table), (totals.get(movedLabel(item.table)) ?? 0) + item.count)
    if (props.preview.comments) totals.set('评论', props.preview.comments)
    return [...totals]
  })
</script>

<template>
  <Stack gap="md">
    <SimpleGrid min="14rem" gap="md">
      <Card
        v-for="side in [
          { entry: from, title: '合并至保留的条目，并成为跳转' },
          { entry: into, title: '保留' },
        ]"
        :key="side.entry.id"
        :padded="false"
        class="p-4 shadow-none"
      >
        <Stack gap="sm">
          <Text as="span" size="xs" tone="muted">{{ side.title }}</Text>
          <Heading :level="3" size="sm" lang="ja">{{ side.entry.label }}</Heading>
          <DescriptionList class="text-sm">
            <template v-for="fact in facts(side.entry)" :key="fact.label">
              <DescriptionTerm>{{ fact.label }}</DescriptionTerm>
              <DescriptionDetails class="wrap-anywhere">{{
                fact.values.join('、')
              }}</DescriptionDetails>
            </template>
          </DescriptionList>
        </Stack>
      </Card>
    </SimpleGrid>
    <Stack v-if="deprecated.length" gap="xs">
      <Text as="span" size="sm" weight="medium">与保留的条目重复的值将被作废</Text>
      <Text v-for="item in deprecated" :key="item" as="span" size="sm" tone="muted">
        {{ item }}
      </Text>
    </Stack>
    <Stack gap="xs">
      <Text as="span" size="sm" weight="medium">将移至保留的条目</Text>
      <DescriptionList v-if="moved.length" orientation="horizontal" class="text-sm">
        <template v-for="[name, count] in moved" :key="name">
          <DescriptionTerm>{{ name }}</DescriptionTerm>
          <DescriptionDetails class="tabular-nums">{{ count }}</DescriptionDetails>
        </template>
      </DescriptionList>
      <Text v-else as="span" size="sm" tone="muted">不会移动其他内容</Text>
    </Stack>
  </Stack>
</template>
