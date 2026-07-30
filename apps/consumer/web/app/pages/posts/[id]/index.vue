<script setup lang="ts">
  import { COMMENT_DETAIL_ACTIONS_KEY } from '~/features/comment/detailBar'
  import { commentFocusId } from '~/features/comment/comment'
  import { postSeo } from '~/features/seo/post'
  import { useViewPing } from '~/features/interaction/useViewPing'

  defineOptions({ name: 'PagePostDetail' })
  definePageMeta({ footer: false, bottomBar: false })

  const route = useRoute()
  const postId = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const focusComment = commentFocusId(route.query.comment)

  const { data } = await useHikariApiData(
    focusComment != null
      ? `/api/pages/posts/${postId}?comment=${focusComment}`
      : `/api/pages/posts/${postId}`,
    { fatal: true },
  )
  useViewPing('post', postId)

  const firstPoll = computed(() => data.value?.post.entity_summaries.polls[0] ?? null)
  const bodyDoc = computed(() => {
    const doc = data.value?.post.content_json
    if (!doc?.content) return doc
    return { ...doc, content: doc.content.filter(node => node.type !== 'poll') }
  })

  const seo = computed(() => (data.value ? postSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? 'Post',
    description: () => seo.value?.description,
    card: { type: 'post', id: postId },
    type: 'article',
    schemaOrg: seo.value?.schema,
  })

  if (data.value) {
    provide(COMMENT_DETAIL_ACTIONS_KEY, {
      type: 'post',
      id: data.value.post.id,
      likeCount: data.value.post.like_count,
      liked: data.value.post.liked,
      favorited: data.value.favorite?.favorited ?? false,
      pickerTitle: `将这篇${data.value.post.covers.length > 0 ? '图文' : '短文'}添加到收藏夹`,
    })
  }
</script>

<template>
  <div v-if="data" class="pt-4 sm:pt-6">
    <div class="mx-auto flex max-w-[1024px] justify-center gap-8 px-0 sm:px-4">
      <article class="w-[600px] max-w-full min-w-0">
        <PostImages :covers="data.post.covers" />

        <h1 v-if="data.post.title" class="mt-6 text-[22px] leading-snug font-bold text-color">
          {{ data.post.title }}
        </h1>

        <PostAuthorBar
          v-if="data.post.creator"
          class="mt-5"
          :author="data.author"
          :stats="data.author_stats"
          :creator="data.post.creator"
          :created-at="data.post.created_at"
          :post-id="data.post.id"
        />

        <HikariContent
          v-if="bodyDoc"
          :doc="bodyDoc"
          :summaries="data.post.entity_summaries"
          :emoji-sets="data.post.emoji_sets"
          preset="post"
          class="mt-5"
        />

        <HikariContentNodesPollCard v-if="firstPoll" :poll="firstPoll" />

        <PostRelatedWorks
          v-if="data.post.related_works.length"
          :works="data.post.related_works"
          class="mt-8"
        />

        <PostFooter :post="data.post" :favorited="data.favorite?.favorited ?? false" class="mt-8" />

        <CommentSection
          target-type="post"
          :target-id="data.post.id"
          :initial="data.comments"
          :author-id="data.post.creator?.id ?? null"
          :allow-comment="data.post.allow_comment !== 'DISALLOW'"
          class="mt-10"
        />
      </article>

      <CommunitySidebar follow footer>
        <FeedSidebar :data="data.sidebar" />
      </CommunitySidebar>
    </div>
  </div>
</template>
