<script setup lang="ts">
  import { ChevronRight, Eye, Star, ThumbsUp } from '@lucide/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameLongReviews' })
  defineProps<{ articles: GalgamePageData['articles'] }>()

  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${n}`)
</script>

<template>
  <GalgameSection
    title="长评"
    :meta="`${articles.meta.total_items} 篇`"
    :empty="!articles.items.length"
    hide-when-empty
  >
    <div class="flex flex-col gap-4">
      <article
        v-for="a in articles.items"
        :key="a.id"
        class="flex flex-col gap-3 rounded-xl border border-surface-200 bg-surface-0 px-6 py-5 dark:border-surface-800 dark:bg-surface-900"
      >
        <div class="flex items-center gap-2 text-[13px]">
          <Avatar :user="a.creator" card shape="circle" class="size-6! shrink-0" />
          <UserName :user="a.creator" class="font-medium text-surface-700 dark:text-surface-200" />
          <span
            v-if="a.rate != null"
            class="inline-flex items-center gap-0.5 font-semibold text-amber-500"
          >
            <Star class="size-3.5 fill-amber-400 text-amber-400" />
            {{ a.rate }}/10
          </span>
        </div>

        <NuxtLink
          :to="`/articles/${a.id}`"
          class="text-lg font-bold wrap-anywhere text-surface-900 transition-colors hover:text-hikari-primary-600 dark:text-surface-0"
        >
          {{ a.title }}
        </NuxtLink>

        <p
          v-if="a.excerpt"
          class="line-clamp-2 text-[13px] leading-relaxed text-surface-600 dark:text-surface-400"
        >
          {{ a.excerpt }}
        </p>

        <div class="flex items-center gap-4 text-xs text-surface-500 dark:text-surface-400">
          <span class="flex items-center gap-1">
            <Eye class="size-3.5" />
            {{ fmt(a.view_count) }}
          </span>
          <span class="flex items-center gap-1">
            <ThumbsUp class="size-3.5" />
            {{ fmt(a.like_count) }}
          </span>
          <span class="flex-1" />
          <NuxtLink
            :to="`/articles/${a.id}`"
            class="flex items-center gap-1 font-medium text-hikari-primary-600 transition-colors hover:text-hikari-primary-700 dark:text-hikari-primary-400"
          >
            阅读全文
            <ChevronRight class="size-3.5" />
          </NuxtLink>
        </div>
      </article>
    </div>
  </GalgameSection>
</template>
