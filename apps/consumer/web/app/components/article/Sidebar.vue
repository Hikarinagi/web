<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'

  defineProps<{ data: ArticlePageData }>()
</script>

<template>
  <Stack gap="md">
    <ArticleSidebarToc :doc="data.article.content_json" />
    <ArticleSidebarAuthorCard
      v-if="data.article.creator"
      :author="data.author"
      :creator="data.article.creator"
    />
    <ArticleSidebarOtherReviews v-if="data.other_reviews.length" :groups="data.other_reviews" />
    <ArticleSidebarRecent v-if="data.recent_articles.length" :articles="data.recent_articles" />
  </Stack>
</template>
