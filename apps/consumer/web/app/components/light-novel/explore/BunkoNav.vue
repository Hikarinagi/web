<script setup lang="ts">
  import type { LightNovelsLandingData } from '~~/server/api/pages/light-novels.get'

  defineOptions({ name: 'LightNovelExploreBunkoNav' })
  defineProps<{ bunko: LightNovelsLandingData['stats']['top_bunko'] }>()
</script>

<template>
  <LightNovelExploreSection v-if="bunko.length" title="按文库筛选">
    <LightNovelExploreRailViewport
      content-class="flex w-[var(--container-app)] flex-wrap items-center gap-2.5 px-6 pb-2"
    >
      <NuxtLink
        v-for="item in bunko"
        :key="item.id"
        :to="`/light-novels/bunko/${item.id}`"
        class="flex w-fit shrink-0 items-center gap-2 rounded-full border border-surface-200 bg-surface-50 px-3.5 py-2 text-sm whitespace-nowrap transition-colors hover:border-hikari-primary-400 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-hikari-primary-500"
      >
        <span class="font-medium text-surface-800 dark:text-surface-100">{{ item.name }}</span>
        <span class="text-xs text-surface-400">{{ item.count }}</span>
      </NuxtLink>
    </LightNovelExploreRailViewport>
  </LightNovelExploreSection>
</template>
