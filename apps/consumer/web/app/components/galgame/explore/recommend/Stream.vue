<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { useGalgameHomeStream } from '~/features/galgame/useHomeStream'

  defineOptions({ name: 'GalgameExploreRecommendStream' })

  const { modules, loading, failed, done, loadMore } = useGalgameHomeStream()
</script>

<template>
  <Stack gap="none" class="gap-14">
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

    <StreamTail
      :loading="loading"
      :failed="failed"
      :done="done"
      :has-items="modules.length > 0"
      @load="loadMore"
    />
  </Stack>
</template>
