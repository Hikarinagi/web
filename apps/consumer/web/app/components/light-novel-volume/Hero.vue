<script setup lang="ts">
  import { Flex, Heading, Link, Stack, Text, VisuallyHidden } from '@hina-ui/vue'
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
  <Stack
    as="section"
    gap="none"
    class="hikari-hero-veil-diagonal relative isolate overflow-hidden border-b border-line bg-surface"
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
      gap="none"
      class="mx-auto w-full max-w-app gap-8 px-5 pt-[calc(var(--app-header-height)+2rem)] pb-10 sm:px-6 lg:flex-row lg:items-start lg:gap-8 lg:pt-[calc(var(--app-header-height)+2.5rem)] lg:pb-12"
    >
      <LightNovelVolumeHeroCover :cover="cover" :title="title">
        <WorkCoverVoteEntry
          work="light_novel_volume"
          :work-id="volume.id"
          :covers="volume.covers"
          :my-media-id="myCoverVote?.my_media_id ?? null"
        />
      </LightNovelVolumeHeroCover>

      <Stack gap="md" class="w-full min-w-0 flex-1 text-center lg:text-left">
        <NuxtLink v-slot="{ href, navigate }" :to="`/light-novels/${lightNovel.id}`" custom>
          <Link
            :href="href ?? undefined"
            tone="neutral"
            :underline="false"
            class="inline-flex max-w-full items-center gap-1.5 self-center text-sm text-muted hover:text-accent-text lg:self-start"
            @click="navigate"
          >
            <LibraryBig class="size-4 shrink-0" aria-hidden="true" />
            <Text as="span" size="sm" truncate>{{ seriesTitle }}</Text>
          </Link>
        </NuxtLink>

        <Stack gap="none" class="gap-3">
          <LightNovelVolumeHeroBadges :volume="volume" />
          <Heading :level="1" class="text-3xl leading-tight font-semibold md:text-4xl">
            {{ title }}
          </Heading>
          <Text v-if="originalName" as="p" size="lg" tone="muted">{{ originalName }}</Text>
        </Stack>

        <LightNovelVolumeHeroMeta :volume="volume" />
        <LightNovelVolumeHeroProgress :progress="progress" />
        <LightNovelVolumeHeroCta :volume="volume" :progress="progress" :my-rate="myRate" />
      </Stack>
    </Flex>
  </Stack>
</template>
