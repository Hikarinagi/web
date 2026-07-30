<script setup lang="ts">
  import type { GalgameRateListItem } from '~/features/galgame/rate'

  defineOptions({ name: 'GalgameRatesList' })
  defineProps<{
    items: GalgameRateListItem[]
    galgameId: number
    total: number
    hasMore: boolean
    pending: boolean
  }>()
  defineEmits<{ loadMore: [] }>()
</script>

<template>
  <div class="flex flex-col gap-6">
    <p
      v-if="!items.length"
      class="rounded-xl border border-surface-200 bg-surface-0 px-6 py-5 text-sm text-surface-500 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-400"
    >
      什么都没有...
    </p>

    <div v-else class="gap-4 md:columns-2">
      <GalgameRatesItem v-for="r in items" :key="r.id" :rate="r" :galgame-id="galgameId" />
    </div>

    <div v-if="hasMore" class="flex justify-center">
      <Button
        label="加载更多"
        severity="secondary"
        outlined
        :loading="pending"
        @click="$emit('loadMore')"
      />
    </div>
    <div
      v-else-if="items.length"
      class="flex items-center justify-center gap-3 text-xs text-surface-400 dark:text-surface-500"
    >
      <span class="h-px w-20 bg-surface-200 dark:bg-surface-700" />
      已显示全部 {{ total }} 条
      <span class="h-px w-20 bg-surface-200 dark:bg-surface-700" />
    </div>
  </div>
</template>
