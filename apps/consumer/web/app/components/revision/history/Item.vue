<script setup lang="ts">
  import { Heading, Inline, Stack, TableCell, TableRow, Text } from '@hina-ui/vue'
  import { summarizeRevisionDiff } from '~/features/revision/diff'
  import type { RevisionSummaryWithDiff } from '~/features/revision/resources'
  import { timeFormat } from '~/utils/time-format'

  const props = defineProps<{ revision: RevisionSummaryWithDiff }>()

  const diffSummary = computed(() => summarizeRevisionDiff(props.revision))
</script>

<template>
  <TableRow>
    <TableCell class="px-4 py-3 align-top md:border-e md:border-line md:py-4">
      <Inline gap="none" align="start" justify="between" :wrap="false" class="gap-3 md:flex-col">
        <Text as="span" size="sm" weight="medium" class="font-mono">v{{ revision.version }}</Text>
        <Text as="span" size="xs" tone="muted" class="md:mt-1">
          {{ timeFormat(revision.created_at) }}
        </Text>
      </Inline>
    </TableCell>

    <TableCell class="px-4 py-3 align-top md:py-4">
      <Inline gap="none" align="baseline" wrap class="min-w-0 gap-x-3 gap-y-1">
        <Heading :level="2" size="sm" truncate class="min-w-0 flex-1 font-medium">
          {{ revision.summary || '未填写修订摘要' }}
        </Heading>
        <Text as="span" size="xs" tone="muted">
          {{ diffSummary.changeCount ? `${diffSummary.changeCount} 项变更` : '无字段变更' }}
        </Text>
      </Inline>

      <Stack
        v-if="diffSummary.rows.length"
        gap="none"
        class="mt-3 divide-y divide-line overflow-hidden rounded-md border border-line"
      >
        <Inline
          v-for="(row, index) in diffSummary.rows"
          :key="index"
          gap="none"
          align="start"
          wrap
          class="gap-x-2 px-2.5 py-1.5 leading-5"
        >
          <Text as="span" size="xs" tone="muted" class="w-12 shrink-0">{{ row.action }}</Text>
          <Text as="span" size="xs" truncate class="min-w-0 flex-1 sm:w-28 sm:flex-none">
            {{ row.label }}
          </Text>
          <Text
            as="span"
            size="xs"
            tone="muted"
            truncate
            class="w-full min-w-0 sm:w-auto sm:flex-1"
          >
            {{ row.summary }}
          </Text>
        </Inline>

        <Text
          v-if="diffSummary.hiddenCount > 0"
          as="p"
          size="xs"
          tone="muted"
          class="px-2.5 py-1.5 leading-5"
        >
          还有 {{ diffSummary.hiddenCount }} 项变更
        </Text>
      </Stack>
    </TableCell>

    <TableCell class="px-4 py-3 align-middle md:border-s md:border-line md:py-4">
      <Inline gap="sm" align="center" :wrap="false" class="min-w-0 md:justify-end">
        <UserCardTrigger :user-id="revision.editor.id">
          <Avatar :user="revision.editor" class="size-6!" />
        </UserCardTrigger>
        <UserName :user="revision.editor" class="min-w-0 text-xs" />
      </Inline>
    </TableCell>
  </TableRow>
</template>
