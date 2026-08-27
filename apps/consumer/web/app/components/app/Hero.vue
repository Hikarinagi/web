<script setup lang="ts">
  import type { AppPageData } from '~~/server/api/pages/app.get'
  import appIcon from '~/assets/images/app/app-icon.webp'
  import kvLandscape from '~/assets/images/app/kv-landscape.webp'
  import shotFeed from '~/assets/images/app/shot-feed.webp'
  import shotFeedDark from '~/assets/images/app/shot-feed-dark.webp'
  import shotNovel from '~/assets/images/app/shot-novel.webp'
  import shotNovelDark from '~/assets/images/app/shot-novel-dark.webp'

  defineOptions({ name: 'AppHero' })

  const props = defineProps<{ manifest: AppPageData['manifest']; androidQr: string | null }>()

  const android = computed(
    () =>
      props.manifest?.android.find(item => item.abi === 'arm64-v8a') ?? props.manifest?.android[0],
  )
  const ios = computed(() => props.manifest?.ios ?? null)

  const flags = useFeatureFlags()
  const downloadable = computed(() => flags.value.app_download)

  function sizeLabel(size: number) {
    return size > 0 ? `${(size / 1e6).toFixed(1)} MB` : ''
  }
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

    <div
      class="pointer-events-none relative z-10 order-2 mx-auto flex w-full max-w-app items-end justify-center gap-4 px-6 pt-10 lg:absolute lg:inset-0 lg:order-none lg:block lg:pt-0"
      aria-hidden="true"
    >
      <div
        class="w-[132px] -rotate-6 lg:absolute lg:top-1/2 lg:left-0 lg:w-[196px] lg:-translate-y-1/2"
      >
        <div
          class="overflow-hidden rounded-[1.5rem] border-[5px] border-surface-800 bg-surface-800 shadow-2xl lg:rounded-[2rem] lg:border-[7px]"
        >
          <HikariImage
            :src="shotFeed"
            alt="社区动态"
            class="block aspect-[1179/2556] w-full dark:hidden"
            image-class="block aspect-[1179/2556] w-full"
          />
          <HikariImage
            :src="shotFeedDark"
            alt="社区动态"
            class="hidden aspect-[1179/2556] w-full dark:block"
            image-class="block aspect-[1179/2556] w-full"
          />
        </div>
      </div>

      <div
        class="w-[118px] rotate-5 lg:absolute lg:top-1/2 lg:left-[16%] lg:w-[168px] lg:-translate-y-[46%]"
      >
        <div
          class="overflow-hidden rounded-[1.8rem] border-[6px] border-surface-700 bg-surface-700 shadow-xl"
        >
          <HikariImage
            :src="shotNovel"
            alt="轻小说详情"
            class="block aspect-[1179/2556] w-full dark:hidden"
            image-class="block aspect-[1179/2556] w-full"
          />
          <HikariImage
            :src="shotNovelDark"
            alt="轻小说详情"
            class="hidden aspect-[1179/2556] w-full dark:block"
            image-class="block aspect-[1179/2556] w-full"
          />
        </div>
      </div>
    </div>

    <div class="relative z-20 order-1 mx-auto box-content w-full max-w-app px-6 py-8 lg:order-none">
      <div
        class="flex w-full flex-col items-center gap-5 text-center lg:ml-[34%] lg:w-[38%] lg:items-start lg:text-left"
      >
        <div class="flex items-center gap-2.5">
          <HikariImage
            src="/brand/hikarinagi-wordmark.svg"
            alt="Hikarinagi"
            class="h-7 w-auto"
            image-class="h-7 w-auto object-contain"
            :lazy="false"
            :skeleton="false"
            :preload="{ fetchPriority: 'high' }"
          />
          <Tag rounded>官方App</Tag>
        </div>

        <h1 class="text-3xl font-bold tracking-tight text-nowrap text-color sm:text-4xl">
          随时能刷，随时能看
        </h1>
        <p class="text-sm text-muted-color sm:text-base">刷同好的动态，追在看的漫画和小说！</p>

        <div class="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <Button
            v-if="android && downloadable"
            as="a"
            :href="android.url"
            download
            :label="`Android 版 ${sizeLabel(android.size)}`"
          >
            <template #icon>
              <Icon name="simple-icons:android" class="size-4" />
            </template>
          </Button>
          <span v-else v-tooltip.top="'敬请期待'" class="inline-flex">
            <Button disabled label="Android 版">
              <template #icon>
                <Icon name="simple-icons:android" class="size-4" />
              </template>
            </Button>
          </span>

          <Button
            v-if="ios && downloadable"
            as="a"
            :href="ios.url"
            download
            severity="secondary"
            outlined
            :label="`iOS 版 ${sizeLabel(ios.size)}`"
          >
            <template #icon>
              <Icon name="simple-icons:apple" class="size-4" />
            </template>
          </Button>
          <span v-else v-tooltip.top="'敬请期待'" class="inline-flex">
            <Button disabled severity="secondary" outlined label="iOS 版">
              <template #icon>
                <Icon name="simple-icons:apple" class="size-4" />
              </template>
            </Button>
          </span>
        </div>

        <AppDownloadNotes :manifest="manifest" />

        <div
          v-tooltip.top="downloadable && androidQr ? undefined : '敬请期待'"
          class="hidden items-center gap-3 lg:flex"
        >
          <div
            class="rounded-lg bg-surface-0 p-2 shadow-md dark:bg-white"
            :class="downloadable && androidQr ? null : 'pointer-events-none opacity-35 grayscale'"
          >
            <div v-if="androidQr" class="relative size-20">
              <HikariImage
                :src="androidQr"
                alt="扫码下载 Android 版"
                class="size-20"
                image-class="size-20"
              />
              <HikariImage
                :src="appIcon"
                alt=""
                class="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-[5px] ring-2 ring-white"
                image-class="size-5 rounded-[5px]"
                :skeleton="false"
                aria-hidden="true"
              />
            </div>
            <div v-else class="size-20 rounded-sm bg-surface-200" />
          </div>
          <span class="text-xs leading-relaxed text-muted-color">
            扫码安装
            <br />
            Android 版
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
