<script setup lang="ts">
  import { useExploreRails } from '~/features/light-novel/useExploreRails'

  defineOptions({ name: 'LightNovelExploreInfiniteRails' })

  const { entries, loading, done, loadMore } = useExploreRails()
  const sentinel = ref<HTMLElement | null>(null)

  useIntersectionObserver(
    sentinel,
    ([entry]) => {
      if (entry?.isIntersecting) void loadMore()
    },
    { rootMargin: '600px' },
  )
</script>

<template>
  <div class="flex flex-col gap-14">
    <template v-for="entry in entries" :key="entry.key">
      <PromotionBanner v-if="entry.kind === 'banner'" :banner="entry.banner" />
      <LightNovelExploreSeriesRail
        v-else-if="entry.kind === 'rail'"
        :title="entry.title"
        :meta="entry.meta"
        :to="entry.to"
        :items="entry.items"
      />
    </template>
    <div ref="sentinel" aria-hidden="true" class="h-px" />
    <div v-if="loading" class="flex justify-center py-4">
      <Spinner :size="28" />
    </div>
    <p
      v-else-if="done && entries.length"
      class="py-4 text-center text-sm text-surface-400 dark:text-surface-500"
    >
      没有更多了
    </p>
  </div>
</template>
