<script setup lang="ts">
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'
  import { titleOf } from '~/features/manga/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'MangaHomeCollectionCards' })
  defineProps<{ collections: MangaHomePageData['collections'] }>()

  const fanClasses = [
    'top-2 left-0 z-1 -rotate-6',
    'top-0 left-7 z-2 rotate-0',
    'top-2 left-14 z-3 rotate-6',
  ]
</script>

<template>
  <MangaHomeSection title="按标签筛选">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLink
        v-for="entry in collections"
        :key="entry.title"
        :to="entry.to"
        class="group flex items-center justify-between gap-4 rounded-xl border border-surface bg-surface-0 p-5 transition-colors hover:border-hikari-primary-300 dark:bg-surface-900 dark:hover:border-hikari-primary-700"
      >
        <div class="min-w-0">
          <p
            class="truncate text-base font-semibold text-surface-900 transition-colors group-hover:text-hikari-primary-600 dark:text-surface-100 dark:group-hover:text-hikari-primary-400"
          >
            {{ entry.title }}
          </p>
          <p class="mt-1 text-sm text-muted-color">{{ entry.total.toLocaleString() }} 部</p>
        </div>
        <div class="relative h-[76px] w-[100px] shrink-0">
          <div
            v-for="(work, index) in entry.covers"
            :key="work.id"
            class="absolute aspect-2/3 w-10 origin-bottom overflow-hidden rounded border border-surface bg-surface-100 shadow-sm dark:bg-surface-800"
            :class="fanClasses[index]"
          >
            <HikariImage
              :src="topVotedMedia(work.covers)"
              :alt="titleOf(work)"
              class="size-full"
              image-class="object-cover object-top"
              preset="small"
            />
          </div>
        </div>
      </NuxtLink>
    </div>
  </MangaHomeSection>
</template>
