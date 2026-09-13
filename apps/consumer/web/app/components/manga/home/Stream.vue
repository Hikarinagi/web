<script setup lang="ts">
  import { useHomeStream } from '~/features/manga/useHomeStream'

  defineOptions({ name: 'MangaHomeStream' })
  const props = defineProps<{ cursor: number | null }>()

  const { modules, loading, done, loadMore } = useHomeStream(props.cursor)
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
    <template v-for="(module, index) in modules" :key="index">
      <PromotionBanner v-if="module.kind === 'banner'" :banner="module.banner" />
      <MangaHomeCollectionCards
        v-else-if="module.kind === 'collections'"
        :collections="module.entries"
      />
      <MangaHomeFeature
        v-else-if="module.kind === 'feature'"
        :item="module.item"
        :intro="module.intro"
      />
      <MangaHomeRail
        v-else-if="module.kind === 'rail'"
        :title="module.title"
        :meta="module.meta"
        :to="module.to"
        :items="module.items"
        :ranked="module.ranked"
      />
      <MangaHomeUpdatesGrid
        v-else
        :title="module.title || undefined"
        :meta="module.meta || undefined"
        :to="module.to || undefined"
        :items="module.items"
      />
    </template>
    <div>
      <div ref="sentinel" aria-hidden="true" class="h-px" />
      <div v-if="loading" class="flex justify-center py-4">
        <Spinner :size="28" />
      </div>
      <p v-else-if="done && modules.length" class="py-4 text-center text-sm text-muted-color">
        没有更多了
      </p>
    </div>
  </div>
</template>
