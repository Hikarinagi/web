<script setup lang="ts">
  import { ArrowRight } from '@lucide/vue'
  import type { LightNovelsLandingData } from '~~/server/api/pages/light-novels.get'

  defineOptions({ name: 'LightNovelExploreAuthorSpotlight' })
  const props = defineProps<{
    spotlight: NonNullable<LightNovelsLandingData['author_spotlight']>
  }>()

  const works = computed(() => props.spotlight.works.items.map(row => row.light_novel))
</script>

<template>
  <section class="flex flex-col gap-5 lg:flex-row lg:items-stretch">
    <NuxtLink
      :to="`/light-novels/author/${spotlight.person.id}`"
      class="group flex shrink-0 flex-col gap-2 rounded-xl border border-surface-200 bg-surface-50 p-5 lg:w-[240px] dark:border-surface-800 dark:bg-surface-900"
    >
      <Tag class="w-fit">作者</Tag>
      <p class="text-xl font-bold text-surface-950 dark:text-white">{{ spotlight.person.name }}</p>
      <p class="text-sm text-surface-500 dark:text-surface-400">
        共 {{ spotlight.works.meta.total_items }} 部作品
      </p>
      <span
        class="mt-auto inline-flex shrink-0 items-center gap-1 text-sm font-medium text-hikari-primary-600 transition-colors group-hover:text-hikari-primary-700 dark:text-hikari-primary-400"
      >
        查看全部
        <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </NuxtLink>
    <LightNovelExploreRailViewport
      class="lg:-mr-6 lg:ml-0 lg:flex-1"
      content-class="flex min-w-max gap-4 px-6 pb-2 lg:pr-6 lg:pl-0"
    >
      <LightNovelExploreSeriesCard
        v-for="work in works"
        :key="work.id"
        :item="work"
        class="w-[136px]"
      />
    </LightNovelExploreRailViewport>
  </section>
</template>
