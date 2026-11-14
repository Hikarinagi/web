<script setup lang="ts">
  import { Inline, Stack, Tag, Text, Time } from '@hina-ui/vue'
  import type { GalgameHistoryPageData } from '~~/server/api/pages/galgames/[id]/revisions/index.get'
  import { titleText } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameHistoryEdits' })
  defineProps<{ edits: GalgameHistoryPageData['history']['items'][number]['edits'] }>()
</script>

<template>
  <Stack as="ol" gap="none" class="divide-y divide-line rounded-lg bg-subtle px-4">
    <Inline
      v-for="edit in edits"
      :key="edit.id"
      as="li"
      gap="md"
      align="baseline"
      :wrap="false"
      class="py-3"
    >
      <Time
        :value="edit.created_at"
        format="time"
        class="w-10 shrink-0 text-xs text-muted tabular-nums"
      />
      <Stack gap="xs" class="min-w-0 flex-1">
        <Text size="xs" tone="muted">
          {{ edit.entries.map(entry => titleText(entry.title)).join('、') }}
        </Text>
        <Inline gap="sm" align="center">
          <Text
            as="span"
            size="sm"
            :tone="edit.reverted ? 'muted' : undefined"
            :class="edit.reverted ? 'line-through' : undefined"
          >
            {{ edit.summary }}
          </Text>
          <Tag v-if="edit.reverted" tone="neutral" size="sm">已撤销</Tag>
        </Inline>
      </Stack>
    </Inline>
  </Stack>
</template>
