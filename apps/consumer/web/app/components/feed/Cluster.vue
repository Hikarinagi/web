<script setup lang="ts">
  import { Inline, Stack } from '@hina-ui/vue'
  import type { FeedCluster } from '~/features/feed/feed'
  import { rowId } from '~/features/feed/feed'

  defineProps<{ cluster: FeedCluster }>()
</script>

<template>
  <Inline gap="none" align="start" :wrap="false" class="relative gap-3 px-2">
    <Stack
      v-if="cluster.rows.length > 1"
      gap="none"
      aria-hidden="true"
      class="pointer-events-none absolute top-9 bottom-2 left-[27.5px] w-px bg-line-strong"
    />
    <Stack
      gap="none"
      class="sticky z-10 self-start py-4.5"
      style="top: calc(var(--app-header-height) + var(--feed-tabs-height) + 0.5rem)"
    >
      <Avatar
        :user="cluster.author"
        card
        card-show-on-click
        class="size-10! shrink-0 border border-line ring-4 ring-canvas"
      />
    </Stack>
    <Stack gap="none" class="min-w-0 flex-1">
      <FeedItemEntry
        v-for="(row, i) in cluster.rows"
        :key="rowId(row)"
        :row="row"
        :hide-name="i > 0"
      />
    </Stack>
  </Inline>
</template>
