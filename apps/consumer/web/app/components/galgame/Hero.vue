<script setup lang="ts">
  import { Flex, Heading, Stack, Text, VisuallyHidden } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { getGalgameBannerSource, getGalgameCover } from '~/utils/media/galgame'

  const props = defineProps<{
    galgame: GalgamePageData['galgame']
    producers: GalgamePageData['producers']
    myRate: GalgamePageData['my_rate']
    myCoverVote: GalgamePageData['my_cover_vote']
    favorited: boolean
  }>()

  const title = computed(
    () => props.galgame.trans_title || props.galgame.origin_title || `Galgame #${props.galgame.id}`,
  )
  const originTitle = computed(() => props.galgame.origin_title || '')
  const cover = computed(() => getGalgameCover(props.galgame))
  const banner = computed(() => getGalgameBannerSource(props.galgame))
  const bannerProcessing = {
    width: 1920,
    height: 720,
    fit: 'cover',
    quality: 72,
    blur: 2,
  } as const
</script>

<template>
  <Stack
    as="section"
    gap="none"
    data-galgame-hero
    class="hikari-hero-veil-side relative isolate overflow-hidden border-b border-line bg-surface"
  >
    <HikariImage
      :src="banner"
      alt=""
      class="absolute inset-0 -z-20 size-full"
      image-class="object-cover"
      :processing="bannerProcessing"
    >
      <template #empty><VisuallyHidden /></template>
      <template #error><VisuallyHidden /></template>
    </HikariImage>

    <Flex
      direction="col"
      justify="end"
      gap="none"
      class="mx-auto min-h-[calc(520px+var(--app-header-height))] w-full max-w-app gap-8 px-5 pt-[calc(var(--app-header-height)+2.25rem)] pb-12 sm:px-6 sm:pt-[calc(var(--app-header-height)+3rem)] lg:min-h-[calc(540px+var(--app-header-height))] lg:flex-row lg:items-center lg:justify-start lg:gap-10 lg:py-14"
    >
      <GalgameHeroCover :cover="cover" :title="title">
        <WorkCoverVoteEntry
          work="galgame"
          :work-id="galgame.id"
          :covers="galgame.covers"
          :my-media-id="myCoverVote?.my_media_id ?? null"
        />
      </GalgameHeroCover>

      <Stack gap="lg" class="w-full min-w-0 flex-1 text-center lg:text-left">
        <Stack gap="none" class="gap-3">
          <GalgameHeroBadges :galgame="galgame" />
          <Heading :level="1" class="text-3xl leading-tight font-semibold md:text-4xl lg:text-5xl">
            {{ title }}
          </Heading>
          <Text v-if="originTitle && originTitle !== title" as="p" size="lg" tone="muted">
            {{ originTitle }}
          </Text>
        </Stack>

        <GalgameHeroMeta :galgame="galgame" :producers="producers" />
        <GalgameHeroLinks :galgame="galgame" />
        <GalgameHeroCta
          class="justify-center lg:justify-start"
          :galgame-id="galgame.id"
          :work-title="title"
          :my-rate="myRate"
          :favorited="favorited"
        />
      </Stack>
    </Flex>
  </Stack>
</template>
