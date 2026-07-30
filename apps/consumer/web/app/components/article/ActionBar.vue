<script setup lang="ts">
  import { MessageSquare } from '@lucide/vue'
  import { COMMENT_SECTION_HASH, requestCommentFocus } from '~/features/comment/comment'
  import { useLike, useLikeView } from '~/features/interaction/useLike'

  const props = defineProps<{
    articleId: number
    likeCount: number
    liked: boolean
    favorited?: boolean
    pickerTitle: string
  }>()

  const { toggle, busy } = useLike('article')
  const view = useLikeView('article', props.articleId, () => ({
    like_count: props.likeCount,
    liked: props.liked,
  }))

  const placeholder =
    '-mx-2 -my-1 w-auto! px-2! py-1! hover:bg-transparent! active:bg-transparent! hover:text-color!'

  async function comment() {
    await navigateTo({ path: `/articles/${props.articleId}`, hash: COMMENT_SECTION_HASH })
    requestCommentFocus()
  }
</script>

<template>
  <div class="flex items-center gap-8 text-muted-color">
    <Button
      login-required
      text
      :severity="view.liked ? undefined : 'secondary'"
      :loading="busy"
      :disabled="busy"
      :label="view.like_count.toString()"
      class="-mx-2 -my-1 gap-1.5! px-2! py-1! hover:bg-transparent! active:bg-transparent!"
      :class="{ 'hover:text-color!': !view.liked }"
      aria-label="赞"
      @click="toggle(articleId)"
    >
      <template #icon><InteractionLikeIcon :active="view.liked" /></template>
    </Button>
    <Button text severity="secondary" :class="placeholder" aria-label="评论" @click="comment">
      <template #icon><MessageSquare /></template>
    </Button>
    <FavoriteToggle
      :id="articleId"
      type="article"
      :initial-favorited="favorited"
      variant="bar"
      :picker-title="pickerTitle"
      :class="placeholder"
    />
    <ShareButton text severity="secondary" :to="`/articles/${articleId}`" :class="placeholder" />
  </div>
</template>
