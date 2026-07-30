<script setup lang="ts">
  import { titleOf, type LightNovelSummary } from '~/features/light-novel/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'LightNovelExploreRanking' })
  defineProps<{ items: LightNovelSummary[] }>()
</script>

<template>
  <LightNovelExploreSection v-if="items.length" title="排行榜" meta="人气最高 · 按浏览量排序">
    <LightNovelExploreRailViewport content-class="flex min-w-max items-stretch gap-5 px-6 pb-2">
      <NuxtLink
        v-for="(item, index) in items"
        :key="item.id"
        :to="`/light-novels/${item.id}`"
        class="group flex w-[206px] shrink-0 flex-col gap-2"
      >
        <div class="flex items-end gap-1.5">
          <span class="text-6xl leading-[0.8] font-bold text-surface-300 dark:text-surface-700">
            {{ index + 1 }}
          </span>
          <div
            class="aspect-7/10 w-[132px] overflow-hidden rounded-lg border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
          >
            <HikariImage
              :src="topVotedMedia(item.covers)"
              :alt="titleOf(item)"
              class="size-full"
              image-class="object-cover object-top"
              preset="medium"
            />
          </div>
        </div>
        <p
          class="truncate text-sm font-medium text-surface-900 transition-colors group-hover:text-hikari-primary-600 dark:text-surface-100 dark:group-hover:text-hikari-primary-400"
        >
          {{ titleOf(item) }}
        </p>
      </NuxtLink>
    </LightNovelExploreRailViewport>
  </LightNovelExploreSection>
</template>
