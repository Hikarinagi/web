<script setup lang="ts">
  import { COMMENT_DETAIL_ACTIONS_KEY } from '~/features/comment/detailBar'
  import { commentFocusId } from '~/features/comment/comment'
  import { articleSeo } from '~/features/seo/article'
  import { useViewPing } from '~/features/interaction/useViewPing'

  defineOptions({ name: 'PageArticleDetail' })
  definePageMeta({ footer: false, bottomBar: false, container: 'full' })

  const route = useRoute()
  const articleId = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const focusComment = commentFocusId(route.query.comment)

  const { data } = await useHikariApiData(
    focusComment != null
      ? `/api/pages/articles/${articleId}?comment=${focusComment}`
      : `/api/pages/articles/${articleId}`,
    { fatal: true },
  )
  useViewPing('article', articleId)

  const seo = computed(() => (data.value ? articleSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? 'Article',
    description: () => seo.value?.description,
    card: { type: 'article', id: articleId },
    type: 'article',
    schemaOrg: seo.value?.schema,
  })

  if (data.value) {
    const a = data.value.article
    provide(COMMENT_DETAIL_ACTIONS_KEY, {
      type: 'article',
      id: a.id,
      likeCount: a.like_count,
      liked: a.liked,
      favorited: data.value.favorite?.favorited ?? false,
      pickerTitle: `将这篇${a.related_galgame_rate_id || a.related_light_novel_rate_id ? '长评' : '文章'}添加到收藏夹`,
    })
  }
</script>

<template>
  <FeedPageShell v-if="data" :follow="false">
    <article>
      <ArticleHeader :article="data.article" :author="data.author" />
      <HikariContent
        v-if="data.article.content_json"
        :doc="data.article.content_json"
        :summaries="data.article.entity_summaries"
        :emoji-sets="data.article.emoji_sets"
        preset="article"
        class="mt-8"
      />
      <ArticleFooter
        :article="data.article"
        :favorited="data.favorite?.favorited ?? false"
        class="mt-10"
      />

      <CommentSection
        target-type="article"
        :target-id="data.article.id"
        :initial="data.comments"
        :author-id="data.article.creator?.id ?? null"
        :allow-comment="data.article.allow_comment !== 'DISALLOW'"
        class="mt-10"
      />
    </article>

    <template #sidebar>
      <ArticleSidebar :data="data" />
    </template>

    <ArticleMobileToc :doc="data.article.content_json" />
  </FeedPageShell>
</template>
