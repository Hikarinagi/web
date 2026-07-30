<script setup lang="ts">
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'

  defineProps<{ data: ArticlePageData }>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <ArticleSidebarToc :doc="data.article.content_json" />
    <ArticleSidebarAuthorCard
      v-if="data.article.creator"
      :author="data.author"
      :stats="data.author_stats"
      :creator="data.article.creator"
    />
    <ArticleSidebarOtherReviews v-if="data.other_reviews.length" :groups="data.other_reviews" />
    <ArticleSidebarRecent v-if="data.recent_articles.length" :articles="data.recent_articles" />
  </div>
</template>
