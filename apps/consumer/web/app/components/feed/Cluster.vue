<script setup lang="ts">
  import { Inline, Stack } from '@hina-ui/vue'
  import type { FeedCluster } from '~/features/feed/feed'
  import { rowId } from '~/features/feed/feed'

  defineProps<{ cluster: FeedCluster }>()
</script>

<template>
  <Inline gap="none" align="start" :wrap="false" class="gap-3 px-2">
    <Stack
      gap="none"
      class="sticky z-10 self-start py-4.5"
      style="top: calc(var(--app-header-height) + var(--feed-tabs-height) + 0.5rem)"
    >
      <Avatar
        :user="cluster.author"
        card
        card-show-on-click
        class="size-10! shrink-0 border border-line"
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
