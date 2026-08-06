<script setup lang="ts">
  import type { FeedCluster } from '~/features/feed/feed'
  import { rowId } from '~/features/feed/feed'

  defineProps<{ cluster: FeedCluster }>()
</script>

<template>
  <div class="relative flex items-start gap-3 px-2">
    <div
      v-if="cluster.rows.length > 1"
      class="pointer-events-none absolute top-9 bottom-2 left-[27.5px] w-px bg-surface-200 dark:bg-surface-800"
      aria-hidden="true"
    />
    <div
      class="sticky z-10 self-start py-4.5"
      style="top: calc(var(--app-header-height) + var(--feed-tabs-height) + 0.5rem)"
    >
      <Avatar
        :user="cluster.author"
        card
        card-show-on-click
        shape="circle"
        class="size-10! shrink-0 border border-surface ring-4 ring-surface-0 dark:ring-surface-950"
      />
    </div>
    <div class="min-w-0 flex-1">
      <FeedItemEntry
        v-for="(row, i) in cluster.rows"
        :key="rowId(row)"
        :row="row"
        :hide-name="i > 0"
      />
    </div>
  </div>
</template>
