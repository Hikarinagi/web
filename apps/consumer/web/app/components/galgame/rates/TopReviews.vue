<script setup lang="ts">
  import { Star } from '@lucide/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameRatesTopReviews' })
  const props = defineProps<{
    rates: GalgamePageData['top_rates']['items']
    total: number
    galgameId: number
  }>()

  const reviews = computed(() =>
    props.rates.filter(r => r.rate != null && r.rate_content.trim()).slice(0, 6),
  )
</script>

<template>
  <div
    class="flex min-w-0 flex-1 flex-col rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900"
  >
    <h3 class="px-5 pt-4 pb-3 text-sm font-bold text-surface-900 dark:text-surface-0">热门短评</h3>

    <p v-if="!reviews.length" class="px-5 pb-4 text-xs text-surface-500 dark:text-surface-400">
      还没有人写短评
    </p>

    <div v-else class="grid grid-cols-1 gap-x-6 gap-y-4 px-5 pb-1 sm:grid-cols-2">
      <div v-for="r in reviews" :key="r.id" class="flex items-start gap-2.5">
        <Avatar :user="r.rater" card shape="circle" class="size-7! shrink-0" />
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <div class="flex items-center gap-1.5">
            <UserName
              :user="r.rater"
              class="truncate text-xs font-bold text-surface-800 dark:text-surface-100"
            />
            <span class="flex-1" />
            <span
              class="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-surface-700 tabular-nums dark:text-surface-300"
            >
              <Star class="size-3 fill-amber-400 text-amber-400" />
              {{ r.rate }}
            </span>
          </div>
          <p
            class="text-xs wrap-anywhere text-surface-600 dark:text-surface-400"
            :class="{ 'line-clamp-2': !r.is_spoiler }"
          >
            <Spoiler v-if="r.is_spoiler" class="line-clamp-2">{{ r.rate_content }}</Spoiler>
            <template v-else>{{ r.rate_content }}</template>
          </p>
        </div>
      </div>
    </div>

    <ViewAllLink v-if="total > 0" :to="`/galgames/${galgameId}/rates`" class="px-5 pt-3 pb-4">
      查看全部 {{ total }} 条短评
    </ViewAllLink>
  </div>
</template>
