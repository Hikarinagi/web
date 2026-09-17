<script setup lang="ts">
  import { Rating } from '@hina-ui/vue'
  import { workPath, workTypeLabel } from '#shared/utils/work'
  import type { FeedWorkRef } from '~/features/feed/feed'

  const props = defineProps<{
    workRef: FeedWorkRef
    score?: number | null
  }>()

  const to = computed(() => workPath(props.workRef.work_type, props.workRef.id))

  const typeLabel = computed(() => workTypeLabel(props.workRef.work_type))
  const { shouldBlockNsfw } = useNsfwPolicy()
  const blocked = computed(() => shouldBlockNsfw(props.workRef.nsfw))

  // 「Galgame · ゆずソフト · 2016」/「轻小说 · 渡航」
  const meta = computed(() =>
    [typeLabel.value, props.workRef.producer, props.workRef.year].filter(Boolean).join(' · '),
  )
</script>

<template>
  <WorkCardTrigger
    v-if="!blocked"
    :work-type="workRef.work_type"
    :work-id="workRef.id"
    class="block"
  >
    <NuxtLink
      :to="to"
      class="relative z-1 flex items-start gap-3 rounded-xl border border-surface-200 bg-surface-0 p-3 shadow-[0_1px_1.5px_rgba(15,23,42,0.05)] transition-colors hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
    >
      <HikariImage
        :src="workRef.cover"
        :alt="workRef.title"
        class="h-[68px] w-12 shrink-0 rounded"
        image-class="size-full object-cover"
        :processing="{ q: 90 }"
      />
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <p class="truncate text-sm font-bold text-color">{{ workRef.title }}</p>
        <p class="truncate text-xs text-muted-color">{{ meta }}</p>
        <div v-if="score != null" class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <Rating :model-value="score" :max="10" :stars="5" readonly size="sm" />
          <span class="text-sm font-medium text-color">{{ score.toFixed(1) }}</span>
        </div>
      </div>
    </NuxtLink>
  </WorkCardTrigger>
</template>
