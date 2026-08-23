<script setup lang="ts">
  import type { LightNovelRateListItem } from '~/features/light-novel/rate'

  defineOptions({ name: 'LightNovelRatesList' })
  defineProps<{
    items: LightNovelRateListItem[]
    lightNovelId: number
    total: number
    hasMore: boolean
    pending: boolean
    filtered: boolean
  }>()
  defineEmits<{ loadMore: [] }>()
</script>

<template>
  <div class="flex flex-col gap-6">
    <p
      v-if="!items.length"
      class="rounded-xl border border-surface-200 bg-surface-0 px-6 py-5 text-sm text-surface-500 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-400"
    >
      {{ filtered ? '没有符合筛选条件的短评' : '还没有人写短评' }}
    </p>

    <div v-else class="gap-4 md:columns-2">
      <LightNovelRatesItem
        v-for="r in items"
        :key="`${r.volume ? 'v' : 's'}${r.id}`"
        :rate="r"
        :light-novel-id="lightNovelId"
      />
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
