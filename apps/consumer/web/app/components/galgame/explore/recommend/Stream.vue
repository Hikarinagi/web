<script setup lang="ts">
  import { useGalgameHomeStream } from '~/features/galgame/useHomeStream'

  defineOptions({ name: 'GalgameExploreRecommendStream' })

  const { modules, loading, failed, done, loadMore } = useGalgameHomeStream()
  const sentinel = ref<HTMLElement | null>(null)
  const nearEnd = ref(false)

  useIntersectionObserver(
    sentinel,
    ([entry]) => {
      nearEnd.value = !!entry?.isIntersecting
    },
    { rootMargin: '600px' },
  )

  watchEffect(
    () => {
      if (nearEnd.value && !loading.value && !failed.value && !done.value) void loadMore()
    },
    { flush: 'post' },
  )
</script>

<template>
  <div class="flex flex-col gap-14">
    <template v-for="module in modules" :key="module.key">
      <PromotionBanner v-if="module.kind === 'banner'" :banner="module.banner" />
      <GalgameExploreRecommendFeature
        v-else-if="module.kind === 'feature'"
        :item="module.item"
        :intro="module.intro"
      />
      <GalgameExploreRecommendRail
        v-else-if="module.kind === 'rail'"
        :title="module.title"
        :to="module.to"
        :items="module.items"
      />
      <GalgameExploreRecommendGrid v-else :items="module.items" />
    </template>
    <div ref="sentinel" aria-hidden="true" class="h-px" />
    <div v-if="loading" class="flex justify-center py-4">
      <Spinner :size="28" />
    </div>
    <div v-else-if="failed" class="flex justify-center py-4">
      <Button label="重新加载" severity="secondary" variant="text" @click="loadMore" />
    </div>
  </div>
</template>
