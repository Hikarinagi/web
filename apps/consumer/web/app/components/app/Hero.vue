<script setup lang="ts">
  import { Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import type { AppPageData } from '~~/server/api/pages/app.get'
  import hinaWordmark from '~/assets/images/app/hina-wordmark.webp'
  import kvLandscape from '~/assets/images/app/kv-landscape.webp'

  defineOptions({ name: 'AppHero' })

  const props = defineProps<{ release: AppPageData['release']; androidUrl: string | null }>()

  const downloadable = computed(() => props.release.available)
</script>

<template>
  <Stack
    as="section"
    gap="none"
    justify="center"
    class="relative isolate min-h-[calc(100dvh-var(--app-bottombar-height)-env(safe-area-inset-bottom))] overflow-hidden md:min-h-[100dvh]"
  >
    <HikariImage
      :src="kvLandscape"
      alt=""
      class="absolute inset-0 -z-10 size-full"
      image-class="size-full object-cover object-[88%_center] md:object-[80%_center] lg:object-[72%_center] xl:object-[64%_center] 2xl:object-[56%_center]"
      :lazy="false"
      :skeleton="false"
      :preload="{ fetchPriority: 'high' }"
      aria-hidden="true"
    />
    <Stack
      gap="none"
      aria-hidden="true"
      class="absolute inset-0 -z-10 bg-linear-to-b/oklab from-surface/92 via-surface/78 to-surface/55 lg:bg-linear-to-r/oklab lg:from-surface/95 lg:via-surface/62 lg:to-transparent dark:bg-canvas/72 dark:bg-none"
    />

    <AppHeroDevices />

    <Stack gap="none" class="relative z-20 order-1 px-6 py-8 lg:order-none">
      <Stack gap="none" class="mx-auto w-full max-w-app">
        <Stack
          gap="none"
          align="center"
          class="w-full gap-5 text-center lg:ml-[34%] lg:w-[38%] lg:items-start lg:text-left"
        >
          <Inline gap="none" align="center" :wrap="false" class="gap-2.5">
            <HikariImage
              :src="hinaWordmark"
              alt="Hinagi"
              class="aspect-[1200/490] h-9 w-auto dark:brightness-0 dark:invert"
              image-class="aspect-[1200/490] h-9 w-auto object-contain"
              :lazy="false"
              :skeleton="false"
              :preload="{ fetchPriority: 'high' }"
            />
            <Tag pill size="md" tone="accent">Hikarinagi 官方App!</Tag>
          </Inline>

          <Heading :level="1" class="text-3xl font-bold tracking-tight text-nowrap sm:text-4xl">
            随时能刷，随时能看
          </Heading>
          <Text as="p" size="sm" tone="muted" class="sm:text-base">
            刷同好的动态，追在看的漫画和小说！
          </Text>

          <AppDownloadButtons :release="release" :downloadable="downloadable" />
          <AppDownloadNotes :release="release" :downloadable="downloadable" />
          <AppDownloadQrCode :url="androidUrl" :downloadable="downloadable" />
        </Stack>
      </Stack>
    </Stack>
  </Stack>
</template>
