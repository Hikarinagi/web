<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { useHomeStream } from '~/features/manga/useHomeStream'

  defineOptions({ name: 'MangaHomeStream' })
  const props = defineProps<{ cursor: number | null }>()

  const { modules, loading, failed, done, loadMore } = useHomeStream(props.cursor)
</script>

<template>
  <Stack gap="none" class="gap-14">
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

    <StreamTail
      :loading="loading"
      :failed="failed"
      :done="done"
      :has-items="modules.length > 0"
      @load="loadMore"
    />
  </Stack>
</template>
