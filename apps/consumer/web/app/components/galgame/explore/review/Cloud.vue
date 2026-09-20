<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'

  defineOptions({ name: 'GalgameExploreReviewCloud' })
  defineProps<{ reviews: ApiData<'/api/v3/galgames/rates/cloud', 'get'> }>()
</script>

<template>
  <section v-if="reviews.items.length" class="flex flex-col gap-4">
    <div class="flex items-baseline gap-3">
      <h2 class="text-2xl font-bold text-surface-950 dark:text-white">玩家们怎么说</h2>
      <!-- <p class="text-sm text-surface-500 dark:text-surface-400">
        {{ reviews.work_count }} 部已评分 · {{ reviews.total_count }} 条短评
      </p> -->
      <p class="text-sm text-surface-500 dark:text-surface-400">{{ reviews.total_count }} 条评价</p>
    </div>

    <div class="relative max-h-112.5 overflow-hidden">
      <div class="gap-3 md:columns-2 xl:columns-4">
        <GalgameExploreReviewCard v-for="item in reviews.items" :key="item.id" :item="item" />
      </div>
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-white to-white/0 dark:from-surface-950"
        aria-hidden="true"
      />
    </div>
  </section>
</template>
