<script setup lang="ts">
  import { LibraryBig } from '@lucide/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import {
    getLightNovelCover,
    getLightNovelTitle,
    getLightNovelVolumeCover,
    getLightNovelVolumeTitle,
  } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelVolumeHero' })
  const props = defineProps<{
    volume: LightNovelVolumePageData['volume']
    lightNovel: LightNovelVolumePageData['light_novel']
    progress: LightNovelVolumePageData['progress']
    myRate: LightNovelVolumePageData['my_rate']
    myCoverVote: LightNovelVolumePageData['my_cover_vote']
  }>()

  const title = computed(() => getLightNovelVolumeTitle(props.volume))
  const seriesTitle = computed(() => getLightNovelTitle(props.lightNovel))
  const originalName = computed(() =>
    props.volume.name_cn && props.volume.name && props.volume.name_cn !== props.volume.name
      ? props.volume.name
      : '',
  )
  const cover = computed(
    () => getLightNovelVolumeCover(props.volume) ?? getLightNovelCover(props.lightNovel),
  )
  const banner = computed(() => cover.value)
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
      <LightNovelVolumeHeroCover :cover="cover" :title="title">
        <WorkCoverVoteEntry
          work="light_novel_volume"
          :work-id="volume.id"
          :covers="volume.covers"
          :my-media-id="myCoverVote?.my_media_id ?? null"
        />
      </LightNovelVolumeHeroCover>

      <div class="w-full min-w-0 flex-1 space-y-4 text-center lg:text-left">
        <NuxtLink
          :to="`/light-novels/${lightNovel.id}`"
          class="inline-flex max-w-full items-center gap-1.5 text-sm text-surface-500 transition-colors hover:text-hikari-primary-600 dark:text-surface-400 dark:hover:text-hikari-primary-400"
        >
          <LibraryBig class="size-4 shrink-0" aria-hidden="true" />
          <span class="truncate">{{ seriesTitle }}</span>
        </NuxtLink>

        <div class="space-y-3">
          <LightNovelVolumeHeroBadges :volume="volume" />
          <h1
            class="text-3xl leading-tight font-semibold text-surface-950 md:text-4xl dark:text-surface-0"
          >
            {{ title }}
          </h1>
          <p v-if="originalName" class="text-lg leading-7 text-surface-600 dark:text-surface-300">
            {{ originalName }}
          </p>
        </div>

        <LightNovelVolumeHeroMeta :volume="volume" />
        <LightNovelVolumeHeroProgress :progress="progress" />
        <LightNovelVolumeHeroCta :volume="volume" :progress="progress" :my-rate="myRate" />
      </div>
    </div>
  </section>
</template>
