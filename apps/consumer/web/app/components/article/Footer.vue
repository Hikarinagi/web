<script setup lang="ts">
  import { Inline, Link, Stack, Tag } from '@hina-ui/vue'
  import { Hash } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'

  const props = defineProps<{ article: ArticlePageData['article']; favorited?: boolean }>()

  const pickerTitle = computed(
    () =>
      `将这篇${props.article.related_galgame_rate_id || props.article.related_light_novel_rate_id ? '长评' : '文章'}添加到收藏夹`,
  )
</script>

<template>
  <Stack gap="none" class="gap-5">
    <Inline
      v-if="article.topics.length || article.sections.length"
      gap="none"
      align="center"
      class="gap-x-3 gap-y-2"
    >
      <Link
        v-for="t in article.topics"
        :key="`t${t.topic.id}`"
        :as="NuxtLink"
        :to="`/topics/${t.topic.id}`"
        class="inline-flex items-center gap-0.5 text-sm"
      >
        <Hash class="size-3.5" />
        {{ t.topic.name }}
      </Link>
      <Tag
        v-for="s in article.sections"
        :key="`s${s.section.id}`"
        :as="NuxtLink"
        :to="`/sections/${s.section.id}`"
        pill
        class="hn-state-layer hn-interactive px-2.5 text-muted"
      >
        {{ s.section.name }}
      </Tag>
    </Inline>
    <ArticleActionBar
      :article-id="article.id"
      :like-count="article.like_count"
      :liked="article.liked"
      :favorited="favorited"
      :picker-title="pickerTitle"
    />
  </Stack>
</template>
