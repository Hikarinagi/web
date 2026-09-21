<script setup lang="ts">
  import { Inline, Stack } from '@hina-ui/vue'
  import shotFeed from '~/assets/images/app/shot-feed.webp'
  import shotFeedDark from '~/assets/images/app/shot-feed-dark.webp'
  import shotNovel from '~/assets/images/app/shot-novel.webp'
  import shotNovelDark from '~/assets/images/app/shot-novel-dark.webp'

  defineOptions({ name: 'AppHeroDevices' })

  const shots = [
    {
      light: shotFeed,
      dark: shotFeedDark,
      alt: '社区动态',
      frame: 'w-33 -rotate-6 lg:absolute lg:top-1/2 lg:left-0 lg:w-49 lg:-translate-y-1/2',
      bezel:
        'rounded-3xl border-[5px] border-neutral-800 bg-neutral-800 shadow-2xl lg:rounded-4xl lg:border-[7px]',
    },
    {
      light: shotNovel,
      dark: shotNovelDark,
      alt: '轻小说详情',
      frame: 'w-29.5 rotate-5 lg:absolute lg:top-1/2 lg:left-[16%] lg:w-42 lg:-translate-y-[46%]',
      bezel: 'rounded-4xl border-[6px] border-neutral-700 bg-neutral-700 shadow-xl',
    },
  ]
</script>

<template>
  <Inline
    gap="none"
    align="end"
    justify="center"
    :wrap="false"
    class="pointer-events-none relative z-10 order-2 mx-auto w-full max-w-app gap-4 px-6 pt-10 lg:absolute lg:inset-0 lg:order-none lg:block lg:pt-0"
    aria-hidden="true"
  >
    <Stack v-for="shot in shots" :key="shot.alt" gap="none" :class="shot.frame">
      <Stack gap="none" :class="cn('overflow-hidden', shot.bezel)">
        <HikariImage
          :src="shot.light"
          :alt="shot.alt"
          class="block aspect-[1179/2556] w-full dark:hidden"
          image-class="block aspect-[1179/2556] w-full"
        />
        <HikariImage
          :src="shot.dark"
          :alt="shot.alt"
          class="hidden aspect-[1179/2556] w-full dark:block"
          image-class="block aspect-[1179/2556] w-full"
        />
      </Stack>
    </Stack>
  </Inline>
</template>
