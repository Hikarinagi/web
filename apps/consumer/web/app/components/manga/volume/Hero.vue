<script setup lang="ts">
  import { LibraryBig } from '@lucide/vue'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { topVotedMedia } from '~/utils/media/image'
  import { getMangaVolumeTitle } from '~/utils/media/manga'

  defineOptions({ name: 'MangaVolumeHero' })
  const props = defineProps<{ volume: MangaVolumePageData['volume'] }>()

  const title = computed(() => getMangaVolumeTitle(props.volume))
  const seriesTitle = computed(() => props.volume.manga.name_cn || props.volume.manga.name)
  const originalName = computed(() =>
    props.volume.name_cn && props.volume.name && props.volume.name_cn !== props.volume.name
      ? props.volume.name
      : '',
  )
  const cover = computed(() => props.volume.cover ?? topVotedMedia(props.volume.manga.covers))
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
      :src="cover"
      alt=""
      class="absolute inset-0 -z-20 h-full w-full"
      image-class="object-cover"
      :processing="bannerProcessing"
    >
      <template #empty><span /></template>
      <template #error><span /></template>
    </HikariImage>
    <div class="absolute inset-0 -z-10 bg-surface-0/85 dark:bg-surface-950/80" />
    <div
      class="absolute inset-0 -z-10 bg-gradient-to-br from-surface-0 via-surface-0/70 to-transparent dark:from-surface-950 dark:via-surface-950/70"
    />
    <div class="mx-auto max-w-app px-5 pt-(--app-header-height) sm:px-6">
      <div
        class="flex flex-col gap-8 pt-8 pb-10 lg:flex-row lg:items-start lg:gap-8 lg:pt-10 lg:pb-12"
      >
        <MangaVolumeHeroCover :cover="cover" :title="title" />

        <div class="w-full min-w-0 flex-1 space-y-4 text-center lg:text-left">
          <NuxtLink
            :to="`/mangas/${volume.manga.id}`"
            class="inline-flex max-w-full items-center gap-1.5 text-sm text-surface-500 transition-colors hover:text-hikari-primary-600 dark:text-surface-400 dark:hover:text-hikari-primary-400"
          >
            <LibraryBig class="size-4 shrink-0" aria-hidden="true" />
            <span class="truncate">{{ seriesTitle }}</span>
          </NuxtLink>

          <div class="space-y-3">
            <h1
              class="text-3xl leading-tight font-semibold text-surface-950 md:text-4xl dark:text-surface-0"
            >
              {{ title }}
            </h1>
            <p v-if="originalName" class="text-lg leading-7 text-surface-600 dark:text-surface-300">
              {{ originalName }}
            </p>
          </div>

          <MangaVolumeHeroMeta :volume="volume" />
          <MangaVolumeHeroCta :volume="volume" />
        </div>
      </div>
    </div>
  </section>
</template>
