<script setup lang="ts">
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'

  defineProps<{ article: ArticlePageData['article']; author: ArticlePageData['author'] }>()
</script>

<template>
  <header class="flex flex-col gap-6">
    <HikariImage
      v-if="article.cover"
      :src="article.cover.src"
      :alt="article.title"
      class="aspect-2/1 w-full overflow-hidden rounded-xl"
      image-class="size-full object-cover"
      :processing="{ q: 90 }"
      preview
    />

    <div class="flex flex-col gap-5">
      <h1 class="text-[28px] leading-tight font-bold text-color">{{ article.title }}</h1>

      <ArticleAuthorBar
        v-if="article.creator"
        :author="author"
        :creator="article.creator"
        :created-at="article.created_at"
        :view-count="article.view_count"
        :article-id="article.id"
      />

      <ArticleRelatedWorks v-if="article.related_works.length" :works="article.related_works" />
    </div>
  </header>
</template>
