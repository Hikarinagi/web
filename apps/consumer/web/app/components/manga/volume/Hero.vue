<script setup lang="ts">
  import { Flex, Heading, Link, Stack, Text, VisuallyHidden } from '@hina-ui/vue'
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
  <Stack
    as="section"
    gap="none"
    class="hikari-hero-veil-soft relative isolate overflow-hidden border-b border-line bg-surface"
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
    <Stack gap="none" class="mx-auto w-full max-w-app px-5 pt-(--app-header-height) sm:px-6">
      <Flex
        direction="col"
        gap="none"
        class="gap-8 pt-8 pb-10 lg:flex-row lg:items-start lg:gap-8 lg:pt-10 lg:pb-12"
      >
        <MangaVolumeHeroCover :cover="cover" :title="title" />

        <Stack gap="none" class="w-full min-w-0 flex-1 gap-4 text-center lg:text-left">
          <NuxtLink v-slot="{ href, navigate }" :to="`/mangas/${volume.manga.id}`" custom>
            <Link
              :href="href ?? undefined"
              tone="neutral"
              :underline="false"
              class="inline-flex max-w-full items-center gap-1.5 text-sm text-muted hover:text-accent-text"
              @click="navigate"
            >
              <LibraryBig class="size-4 shrink-0" aria-hidden="true" />
              <Text as="span" size="sm" truncate class="text-inherit">{{ seriesTitle }}</Text>
            </Link>
          </NuxtLink>

          <Stack gap="none" class="gap-3">
            <Heading :level="1" class="text-3xl leading-tight md:text-4xl">{{ title }}</Heading>
            <Text v-if="originalName" size="lg" tone="muted" class="leading-7">
              {{ originalName }}
            </Text>
          </Stack>

          <MangaVolumeHeroMeta :volume="volume" />
          <MangaVolumeHeroCta :volume="volume" />
        </Stack>
      </Flex>
    </Stack>
  </Stack>
</template>
