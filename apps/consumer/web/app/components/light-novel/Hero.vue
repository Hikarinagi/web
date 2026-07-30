<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { getLightNovelCover, getLightNovelTitle } from '~/utils/media/light-novel'

  const props = defineProps<{
    lightNovel: LightNovelPageData['light_novel']
    volumes: LightNovelPageData['volumes']
    people: LightNovelPageData['people']
    producers: LightNovelPageData['producers']
    myRate: LightNovelPageData['my_rate']
    myCoverVote: LightNovelPageData['my_cover_vote']
    favorited: boolean
    progress: LightNovelPageData['progress']
  }>()

  const title = computed(() => getLightNovelTitle(props.lightNovel))
  const originalTitle = computed(() =>
    props.lightNovel.name_cn && props.lightNovel.name_cn !== props.lightNovel.name
      ? props.lightNovel.name
      : '',
  )
  const cover = computed(() => getLightNovelCover(props.lightNovel))
  const bunko = computed(
    () => props.producers.find(item => item.relation === 'bunko')?.producer ?? null,
  )
  const banner = computed(() => getLightNovelCover(props.lightNovel))
  const bannerProcessing = {
    width: 1920,
    height: 720,
    fit: 'cover',
    quality: 72,
    blur: 36,
  } as const
</script>

<template>
  <section
    class="relative isolate overflow-hidden border-b border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950"
  >
    <HikariImage
      :src="banner"
      alt=""
      class="absolute inset-0 -z-20 h-full w-full"
      image-class="object-cover"
      :processing="bannerProcessing"
    >
      <template #empty><span /></template>
      <template #error><span /></template>
    </HikariImage>
    <div class="absolute inset-0 -z-10 bg-surface-0/80 dark:bg-surface-950/76" />
    <div
      class="absolute inset-0 -z-10 bg-[linear-gradient(115deg,var(--p-surface-0)_0%,rgba(255,255,255,0.86)_42%,rgba(244,114,182,0.12)_100%),radial-gradient(circle_at_18%_18%,rgba(57,197,187,0.18),transparent_32%)] dark:bg-[linear-gradient(115deg,var(--p-surface-950)_0%,rgba(3,7,18,0.86)_42%,rgba(244,114,182,0.12)_100%),radial-gradient(circle_at_18%_18%,rgba(124,235,224,0.14),transparent_34%)]"
    />
    <div
      class="mx-auto flex max-w-app flex-col gap-8 px-5 pt-[calc(var(--app-header-height)+2rem)] pb-10 sm:px-6 lg:flex-row lg:items-start lg:gap-8 lg:pt-[calc(var(--app-header-height)+2.5rem)] lg:pb-12"
    >
      <LightNovelHeroCover :cover="cover" :title="title">
        <WorkCoverVoteEntry
          work="light_novel"
          :work-id="lightNovel.id"
          :covers="lightNovel.covers"
          :my-media-id="myCoverVote?.my_media_id ?? null"
        />
      </LightNovelHeroCover>

      <div class="w-full min-w-0 flex-1 space-y-4 text-center lg:text-left">
        <div class="space-y-3">
          <LightNovelHeroBadges :light-novel="lightNovel" :bunko="bunko" />
          <h1
            class="text-3xl leading-tight font-semibold text-surface-950 md:text-4xl dark:text-surface-0"
          >
            {{ title }}
          </h1>
          <p v-if="originalTitle" class="text-lg leading-7 text-surface-600 dark:text-surface-300">
            {{ originalTitle }}
          </p>
        </div>

        <LightNovelHeroMeta
          :light-novel="lightNovel"
          :people="people"
          :producers="producers"
          :volume-count="volumes.length"
        />
        <LightNovelHeroCta
          :light-novel-id="lightNovel.id"
          :title="title"
          :volumes="volumes"
          :my-rate="myRate"
          :favorited="favorited"
          :progress="progress"
        />
      </div>
    </div>
  </section>
</template>
