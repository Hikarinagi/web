<script setup lang="ts">
  import { Hash } from '@lucide/vue'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'

  const props = defineProps<{ article: ArticlePageData['article']; favorited?: boolean }>()

  const pickerTitle = computed(
    () =>
      `将这篇${props.article.related_galgame_rate_id || props.article.related_light_novel_rate_id ? '长评' : '文章'}添加到收藏夹`,
  )
</script>

<template>
  <div class="flex flex-col gap-5">
    <div
      v-if="article.topics.length || article.sections.length"
      class="flex flex-wrap items-center gap-x-3 gap-y-2"
    >
      <NuxtLink
        v-for="t in article.topics"
        :key="`t${t.topic.id}`"
        :to="`/topics/${t.topic.id}`"
        class="inline-flex items-center gap-0.5 text-sm text-primary transition-colors hover:text-primary-600"
      >
        <Hash class="size-3.5" />
        {{ t.topic.name }}
      </NuxtLink>
      <NuxtLink
        v-for="s in article.sections"
        :key="`s${s.section.id}`"
        :to="`/sections/${s.section.id}`"
        class="rounded-full bg-surface-100 px-2.5 py-0.5 text-[13px] text-muted-color transition-colors hover:text-color dark:bg-surface-800"
      >
        {{ s.section.name }}
      </NuxtLink>
    </div>
    <ArticleActionBar
      :article-id="article.id"
      :like-count="article.like_count"
      :liked="article.liked"
      :favorited="favorited"
      :picker-title="pickerTitle"
    />
  </div>
</template>
