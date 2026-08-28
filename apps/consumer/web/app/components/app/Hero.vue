<script setup lang="ts">
  import type { AppPageData } from '~~/server/api/pages/app.get'
  import hinaWordmark from '~/assets/images/app/hina-wordmark.webp'
  import kvLandscape from '~/assets/images/app/kv-landscape.webp'

  defineOptions({ name: 'AppHero' })

  const props = defineProps<{ release: AppPageData['release']; androidQr: string | null }>()

  const downloadable = computed(() => props.release.available)
</script>

<template>
  <section
    class="relative isolate flex min-h-[calc(100dvh-var(--app-bottombar-height)-env(safe-area-inset-bottom))] flex-col justify-center overflow-hidden md:min-h-[100dvh]"
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
    <div
      class="absolute inset-0 -z-10 bg-linear-to-b/oklab from-surface-0/92 via-surface-0/78 to-surface-0/55 lg:bg-linear-to-r/oklab lg:from-surface-0/95 lg:via-surface-0/62 lg:to-transparent dark:bg-surface-950/72 dark:bg-none"
      aria-hidden="true"
    />

    <AppHeroDevices />

    <div class="relative z-20 order-1 mx-auto box-content w-full max-w-app px-6 py-8 lg:order-none">
      <div
        class="flex w-full flex-col items-center gap-5 text-center lg:ml-[34%] lg:w-[38%] lg:items-start lg:text-left"
      >
        <div class="flex items-center gap-2.5">
          <HikariImage
            :src="hinaWordmark"
            alt="Hinagi"
            class="h-9 w-auto"
            image-class="h-9 w-auto object-contain"
            :lazy="false"
            :skeleton="false"
            :preload="{ fetchPriority: 'high' }"
          />
          <Tag rounded>Hikarinagi 官方App!</Tag>
        </div>

        <h1 class="text-3xl font-bold tracking-tight text-nowrap text-color sm:text-4xl">
          随时能刷，随时能看
        </h1>
        <p class="text-sm text-muted-color sm:text-base">刷同好的动态，追在看的漫画和小说！</p>

        <AppDownloadButtons :release="release" :downloadable="downloadable" />
        <AppDownloadNotes :release="release" :downloadable="downloadable" />
        <AppDownloadQrCode :src="androidQr" :downloadable="downloadable" />
      </div>
    </div>
  </section>
</template>
