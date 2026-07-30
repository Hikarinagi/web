<script setup lang="ts">
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { getMangaCover, getMangaTitle } from '~/utils/media/manga'

  defineOptions({ name: 'MangaHero' })

  const props = defineProps<{
    manga: MangaPageData['manga']
    chapters: MangaPageData['chapters']
    volumes: MangaPageData['volumes']
    people: MangaPageData['people']
    producers: MangaPageData['producers']
    myRate: MangaPageData['my_rate']
    progress: MangaPageData['progress']
    favorited?: boolean
  }>()

  const title = computed(() => getMangaTitle(props.manga))
  const originalTitle = computed(() =>
    props.manga.name_cn && props.manga.name_cn !== props.manga.name ? props.manga.name : '',
  )
  const cover = computed(() => getMangaCover(props.manga))
  const magazine = computed(
    () => props.producers.find(item => item.role === 'MAGAZINE')?.producer ?? null,
  )
  const volumeCount = computed(() => props.volumes.length)
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
    <div class="absolute inset-0 -z-10 bg-surface-0/80 dark:bg-surface-950/76" />
    <div
      v-if="cover"
      class="absolute inset-0 -z-10 bg-[linear-gradient(115deg,var(--p-surface-0)_0%,rgba(255,255,255,0.86)_42%,rgba(244,114,182,0.12)_100%),radial-gradient(circle_at_18%_18%,rgba(57,197,187,0.18),transparent_32%)] dark:bg-[linear-gradient(115deg,var(--p-surface-950)_0%,rgba(3,7,18,0.86)_42%,rgba(244,114,182,0.12)_100%),radial-gradient(circle_at_18%_18%,rgba(124,235,224,0.14),transparent_34%)]"
    />
    <div
      v-else
      class="absolute inset-0 -z-10 bg-[linear-gradient(115deg,var(--p-surface-0)_0%,var(--p-surface-100)_100%)] dark:bg-[linear-gradient(115deg,var(--p-surface-950)_0%,var(--p-surface-900)_100%)]"
    />
    <div
      class="mx-auto flex max-w-app flex-col gap-8 px-5 pt-[calc(var(--app-header-height)+2rem)] pb-10 sm:px-6 lg:flex-row lg:items-start lg:gap-8 lg:pt-[calc(var(--app-header-height)+2.5rem)] lg:pb-12"
    >
      <MangaHeroCover :cover="cover" :title="title" />

      <div class="w-full min-w-0 flex-1 space-y-4 text-center lg:text-left">
        <div class="space-y-3">
          <MangaHeroBadges :manga="manga" :magazine="magazine" />
          <h1
            class="text-3xl leading-tight font-semibold text-surface-950 md:text-4xl dark:text-surface-0"
          >
            {{ title }}
          </h1>
          <p v-if="originalTitle" class="text-lg leading-7 text-surface-600 dark:text-surface-300">
            {{ originalTitle }}
          </p>
        </div>

        <MangaHeroMeta
          :manga="manga"
          :people="people"
          :producers="producers"
          :volume-count="volumeCount"
        />
        <MangaHeroCta
          :manga-id="manga.id"
          :title="title"
          :chapters="chapters"
          :my-rate="myRate"
          :progress="progress"
          :favorited="favorited ?? false"
        />
      </div>
    </div>
  </section>
</template>
