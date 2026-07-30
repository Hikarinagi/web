<script setup lang="ts">
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'
  import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

  defineProps<{ articles: ArticlePageData['recent_articles'] }>()

  const views = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
</script>

<template>
  <ArticlePanel title="作者最近写的">
    <ul class="pb-1.5">
      <li v-for="a in articles" :key="a.id">
        <NuxtLink
          :to="`/articles/${a.id}`"
          class="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
        >
          <HikariImage
            v-if="a.cover"
            :src="a.cover.src"
            :alt="a.title"
            class="h-12 w-16 shrink-0 overflow-hidden rounded"
            image-class="size-full object-cover"
            :processing="{ q: 80 }"
          />
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <p class="line-clamp-2 text-[13px] font-medium text-color">{{ a.title }}</p>
            <span class="text-[11px] text-muted-color">
              {{ datePartFormat(a.created_at, TimeFormatEnum.M_D_CN) }} ·
              {{ views(a.view_count) }} 阅读
            </span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </ArticlePanel>
</template>
