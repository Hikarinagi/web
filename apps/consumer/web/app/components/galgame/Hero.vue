<script setup lang="ts">
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
  <section
    data-galgame-hero
    class="relative isolate overflow-hidden border-b border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950"
  >
    <HikariImage
      :src="banner"
      alt=""
      class="absolute inset-0 -z-20 h-full w-full"
      image-class="object-cover"
      :processing="bannerProcessing"
    >
      <template #empty>
        <span />
      </template>
      <template #error><span /></template>
    </HikariImage>
    <div class="absolute inset-0 -z-10 bg-surface-0/76 dark:bg-surface-950/72" />
    <div
      class="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--p-surface-0)_0%,rgba(255,255,255,0.82)_44%,rgba(255,255,255,0.54)_100%)] dark:bg-[linear-gradient(90deg,var(--p-surface-950)_0%,rgba(3,7,18,0.82)_45%,rgba(3,7,18,0.54)_100%)]"
    />
    <div
      class="mx-auto flex min-h-[calc(520px+var(--app-header-height))] max-w-app flex-col justify-end gap-8 px-5 pt-[calc(var(--app-header-height)+2.25rem)] pb-12 sm:px-6 sm:pt-[calc(var(--app-header-height)+3rem)] lg:min-h-[calc(540px+var(--app-header-height))] lg:flex-row lg:items-center lg:justify-start lg:gap-10 lg:py-14"
    >
      <GalgameHeroCover :cover="cover" :title="title">
        <WorkCoverVoteEntry
          work="galgame"
          :work-id="galgame.id"
          :covers="galgame.covers"
          :my-media-id="myCoverVote?.my_media_id ?? null"
        />
      </GalgameHeroCover>

      <div class="w-full min-w-0 flex-1 space-y-6 text-center lg:text-left">
        <div class="space-y-3">
          <GalgameHeroBadges :galgame="galgame" />
          <h1
            class="text-3xl leading-tight font-semibold text-surface-950 md:text-4xl lg:text-5xl dark:text-surface-0"
          >
            {{ title }}
          </h1>
          <p
            v-if="originTitle && originTitle !== title"
            class="text-lg leading-7 text-surface-600 dark:text-surface-300"
          >
            {{ originTitle }}
          </p>
        </div>

        <GalgameHeroMeta :galgame="galgame" :producers="producers" />
        <GalgameHeroLinks :galgame="galgame" />
        <GalgameHeroCta
          class="justify-center lg:justify-start"
          :galgame-id="galgame.id"
          :work-title="title"
          :my-rate="myRate"
          :favorited="favorited"
        />
      </div>
    </div>
  </section>
</template>
