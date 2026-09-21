<script setup lang="ts">
  import { Heading, Stack } from '@hina-ui/vue'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'

  defineProps<{ article: ArticlePageData['article']; author: ArticlePageData['author'] }>()
</script>

<template>
  <Stack as="header" gap="lg">
    <HikariImage
      v-if="article.cover"
      :src="article.cover"
      :alt="article.title"
      class="aspect-2/1 w-full overflow-hidden rounded-xl"
      image-class="size-full object-cover"
      :processing="{ q: 90 }"
      preview
    />

    <Stack gap="none" class="gap-5">
      <Heading :level="1" size="2xl" class="leading-tight font-bold">{{ article.title }}</Heading>

      <ArticleAuthorBar
        v-if="article.creator"
        :author="author"
        :creator="article.creator"
        :created-at="article.created_at"
        :view-count="article.view_count"
        :article-id="article.id"
      />

      <ArticleRelatedWorks v-if="article.related_works.length" :works="article.related_works" />
    </Stack>
  </Stack>
</template>
