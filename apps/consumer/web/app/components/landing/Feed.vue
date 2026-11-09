<script setup lang="ts">
  import { Grid, Stack } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { reasonLabel, type LandingKind } from '~/features/landing/labels'
  import { bannerForPosition, type PromoBanner } from '~/features/promotion/placement'
  import {
    useLandingFeed,
    type LandingFeedItem,
    type LandingFeedPath,
  } from '~/features/landing/useLandingFeed'
  import { galgameWork, mangaWork, novelWork } from '~/features/landing/works'

  type GalgameFeedItem = ApiData<'/api/v3/landing/galgames/feed', 'get'>['items'][number]
  type NovelFeedItem = ApiData<'/api/v3/landing/light-novels/feed', 'get'>['items'][number]
  type MangaFeedItem = ApiData<'/api/v3/landing/mangas/feed', 'get'>['items'][number]

  defineOptions({ name: 'LandingFeed' })
  const props = defineProps<{
    path: LandingFeedPath
    initial: { items: LandingFeedItem[]; cursor: string | null }
    kind: LandingKind
    banners: PromoBanner[]
  }>()

  const { items, loading, failed, done, load } = useLandingFeed(props.path, props.initial)
  const batch = 24
  const entries = computed(() =>
    items.value.flatMap((item, index) => {
      const work =
        props.kind === 'galgame'
          ? galgameWork(item as GalgameFeedItem)
          : props.kind === 'light_novel'
            ? novelWork(item as NovelFeedItem)
            : mangaWork(item as MangaFeedItem)
      const card = { key: `work-${work.id}`, work, reason: reasonLabel(item.reason, props.kind) }
      const ended = (index + 1) % batch === 0 ? (index + 1) / batch : 0
      const banner = bannerForPosition(ended, props.banners, 2)
      return banner ? [card, { key: `banner-${ended}`, banner }] : [card]
    }),
  )
</script>

<template>
  <Stack gap="md">
    <Grid
      :cols="3"
      class="grid-flow-row-dense gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6 lg:gap-x-6 lg:gap-y-8"
    >
      <template v-for="entry in entries" :key="entry.key">
        <Stack v-if="'banner' in entry" gap="none" class="col-span-full">
          <PromotionBanner :banner="entry.banner" />
        </Stack>
        <BrowseWorkCard
          v-else
          :to="entry.work.to"
          :title="entry.work.title"
          :sub="entry.reason"
          :cover="entry.work.cover"
          :ratio="kind === 'galgame' ? '3/4' : '2/3'"
          plain-sub
        />
      </template>
    </Grid>
    <StreamTail
      :loading="loading"
      :failed="failed"
      :done="done"
      :has-items="entries.length > 0"
      root-margin="800px"
      @load="load"
    />
  </Stack>
</template>
