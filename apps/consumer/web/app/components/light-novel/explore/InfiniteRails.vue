<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { useExploreRails } from '~/features/light-novel/useExploreRails'

  defineOptions({ name: 'LightNovelExploreInfiniteRails' })

  const { entries, loading, failed, done, loadMore } = useExploreRails()
</script>

<template>
  <Stack gap="none" class="gap-14">
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

    <StreamTail
      :loading="loading"
      :failed="failed"
      :done="done"
      :has-items="entries.length > 0"
      @load="loadMore"
    />
  </Stack>
</template>
