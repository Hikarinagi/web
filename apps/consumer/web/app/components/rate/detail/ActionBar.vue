<script setup lang="ts">
  import { IconButton, Inline } from '@hina-ui/vue'
  import { MessageSquare } from '@lucide/vue'
  import { COMMENT_SECTION_HASH, requestCommentFocus } from '~/features/comment/comment'
  import type { FavoriteEntityType } from '~/features/favorite/entity'
  import { useLike, useLikeView, type LikeKind } from '~/features/interaction/useLike'

  defineOptions({ name: 'RateDetailActionBar' })

  const props = defineProps<{
    kind: LikeKind
    rateId: number
    workId: number
    likeCount: number
    myValue: number
    favoriteType: FavoriteEntityType
    favoriteId: number
    favorited: boolean
    pickerTitle: string
    shareTo: string
  }>()

  const { toggle, busy } = useLike(props.kind)
  const view = useLikeView(props.kind, props.rateId, () => ({
    like_count: props.likeCount,
    liked: props.myValue === 1,
  }))

  async function comment() {
    await navigateTo({ path: props.shareTo, hash: COMMENT_SECTION_HASH })
    requestCommentFocus()
  }
</script>

<template>
  <Inline gap="xl">
    <AuthGateButton
      variant="ghost"
      :tone="view.liked ? 'accent' : 'neutral'"
      size="sm"
      :loading="busy"
      :disabled="busy"
      aria-label="赞"
      @click="toggle(rateId, { parentId: workId, liked: view.liked })"
    >
      <template #icon><InteractionLikeIcon :active="view.liked" /></template>
      {{ view.like_count }}
    </AuthGateButton>
    <IconButton label="评论" size="sm" @click="comment">
      <MessageSquare />
    </IconButton>
    <FavoriteToggle
      :id="favoriteId"
      :type="favoriteType"
      :initial-favorited="favorited"
      variant="bar"
      size="sm"
      :picker-title="pickerTitle"
    />
    <ShareButton :to="shareTo" size="sm" />
  </Inline>
</template>
