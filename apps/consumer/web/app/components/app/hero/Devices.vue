<script setup lang="ts">
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
      frame:
        'w-[132px] -rotate-6 lg:absolute lg:top-1/2 lg:left-0 lg:w-[196px] lg:-translate-y-1/2',
      bezel:
        'rounded-[1.5rem] border-[5px] border-surface-800 bg-surface-800 shadow-2xl lg:rounded-[2rem] lg:border-[7px]',
    },
    {
      light: shotNovel,
      dark: shotNovelDark,
      alt: '轻小说详情',
      frame:
        'w-[118px] rotate-5 lg:absolute lg:top-1/2 lg:left-[16%] lg:w-[168px] lg:-translate-y-[46%]',
      bezel: 'rounded-[1.8rem] border-[6px] border-surface-700 bg-surface-700 shadow-xl',
    },
  ]
</script>

<template>
  <div
    class="pointer-events-none relative z-10 order-2 mx-auto flex w-full max-w-app items-end justify-center gap-4 px-6 pt-10 lg:absolute lg:inset-0 lg:order-none lg:block lg:pt-0"
    aria-hidden="true"
  >
    <div v-for="shot in shots" :key="shot.alt" :class="shot.frame">
      <div class="overflow-hidden" :class="shot.bezel">
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
      </div>
    </div>
  </div>
</template>
