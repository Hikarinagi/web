<script setup lang="ts">
  import { Flex, Heading, Stack, Text, VisuallyHidden } from '@hina-ui/vue'
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
  <Stack
    as="section"
    gap="none"
    class="relative isolate overflow-hidden border-b border-line bg-surface"
    :class="cover ? 'hikari-hero-veil-diagonal' : 'hikari-hero-veil-plain'"
  >
    <HikariImage
      :src="cover"
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
      gap="none"
      class="mx-auto w-full max-w-app gap-8 px-5 pt-[calc(var(--app-header-height)+2rem)] pb-10 sm:px-6 lg:flex-row lg:items-start lg:gap-8 lg:pt-[calc(var(--app-header-height)+2.5rem)] lg:pb-12"
    >
      <MangaHeroCover :cover="cover" :title="title" />

      <Stack gap="md" class="w-full min-w-0 flex-1 text-center lg:text-left">
        <Stack gap="none" class="gap-3">
          <MangaHeroBadges :manga="manga" :magazine="magazine" />
          <Heading :level="1" class="text-3xl leading-tight font-semibold md:text-4xl">
            {{ title }}
          </Heading>
          <Text v-if="originalTitle" as="p" size="lg" tone="muted">{{ originalTitle }}</Text>
        </Stack>

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
      </Stack>
    </Flex>
  </Stack>
</template>
