<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import { MessageSquare } from '@lucide/vue'
  import { COMMENT_SECTION_HASH, requestCommentFocus } from '~/features/comment/comment'
  import { useLike, useLikeView } from '~/features/interaction/useLike'

  const props = defineProps<{
    postId: number
    likeCount: number
    liked: boolean
    favorited?: boolean
    pickerTitle: string
  }>()

  const { toggle, busy } = useLike('post')
  const view = useLikeView('post', props.postId, () => ({
    like_count: props.likeCount,
    liked: props.liked,
  }))

  async function comment() {
    await navigateTo({ path: `/posts/${props.postId}`, hash: COMMENT_SECTION_HASH })
    requestCommentFocus()
  }
</script>

<template>
  <Inline gap="xl">
    <Button
      login-required
      variant="ghost"
      :tone="view.liked ? 'accent' : 'neutral'"
      size="sm"
      :loading="busy"
      :disabled="busy"
      aria-label="赞"
      @click="toggle(postId)"
    >
      <template #icon><InteractionLikeIcon :active="view.liked" /></template>
      {{ view.like_count }}
    </Button>
    <IconButton label="评论" size="sm" @click="comment">
      <MessageSquare />
    </IconButton>
    <FavoriteToggle
      :id="postId"
      type="post"
      :initial-favorited="favorited"
      variant="bar"
      size="sm"
      :picker-title="pickerTitle"
    />
    <ShareButton :to="`/posts/${postId}`" size="sm" />
  </Inline>
</template>
