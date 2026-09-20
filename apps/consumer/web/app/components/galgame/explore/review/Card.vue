<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { Star } from '@lucide/vue'

  defineOptions({ name: 'GalgameExploreReviewCard' })
  type ReviewCloud = ApiData<'/api/v3/galgames/rates/cloud', 'get'>
  defineProps<{ item: ReviewCloud['items'][number] }>()
</script>

<template>
  <NuxtLink
    :to="`/galgames/${item.work_ref.id}`"
    class="group mb-3 flex break-inside-avoid flex-col gap-1 rounded-lg border border-surface-200 bg-surface-0 px-3 py-2.5 transition-colors hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
  >
    <p class="text-sm leading-relaxed wrap-anywhere text-surface-800 dark:text-surface-100">
      {{ item.rate_content }}
    </p>
    <p class="text-xs leading-relaxed wrap-anywhere text-surface-500 dark:text-surface-400">
      《{{ item.work_ref.title }}》 ·
      <UserName :user="item.author" class="font-normal text-surface-500 dark:text-surface-400" />
      <span v-if="item.rate" class="inline-flex items-center gap-0.5">
        ·
        <Star class="inline size-3 fill-amber-400 text-amber-400" />
        {{ item.rate }}
      </span>
    </p>
  </NuxtLink>
</template>
