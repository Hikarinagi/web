<script setup lang="ts">
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'

  const props = defineProps<{
    author: ArticlePageData['author']
    stats: ArticlePageData['author_stats']
    creator: NonNullable<ArticlePageData['article']['creator']>
  }>()

  const meta = computed(() =>
    props.stats
      ? `${props.stats.article_count} 篇 · 玩过 ${props.stats.played_count} 部 · 看过 ${props.stats.read_count} 部`
      : '',
  )
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 p-4 shadow-[0_1px_1.5px_rgba(15,23,42,0.05)] dark:border-surface-800 dark:bg-surface-900"
  >
    <Avatar :user="creator" card shape="circle" class="size-11! shrink-0" />
    <div class="min-w-0 flex-1">
      <UserName :user="creator" class="text-sm font-semibold text-color" />
      <p v-if="meta" class="text-xs text-muted-color">{{ meta }}</p>
    </div>
    <CommunityFollowButton
      :user-id="creator.id"
      :initial-following="author?.is_following ?? false"
    />
  </div>
</template>
