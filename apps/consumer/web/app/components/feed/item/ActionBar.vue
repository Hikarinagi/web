<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import { MessageSquare } from '@lucide/vue'
  import { COMMENT_SECTION_HASH, requestCommentFocus } from '~/features/comment/comment'
  import type { FavoriteEntityType } from '~/features/favorite/entity'
  import { feedItemPath, type BackendFeedItem } from '~/features/feed/feed'
  import { useLike, useLikeView } from '~/features/interaction/useLike'

  const props = defineProps<{ item: BackendFeedItem }>()

  const LIKEABLE = ['post', 'article', 'galgame_rate', 'light_novel_rate', 'manga_rate']
  const canLike = LIKEABLE.includes(props.item.type)
  const kind = (canLike ? props.item.type : 'post') as
    'post' | 'article' | 'galgame_rate' | 'light_novel_rate' | 'manga_rate'
  const isRate = kind === 'galgame_rate' || kind === 'light_novel_rate' || kind === 'manga_rate'
  const { toggle, busy } = useLike(kind)
  const view = useLikeView(kind, props.item.id, () => ({
    like_count: 'like_count' in props.item ? props.item.like_count : 0,
    liked:
      'liked' in props.item
        ? props.item.liked
        : 'my_value' in props.item
          ? props.item.my_value === 1
          : false,
  }))

  function like() {
    if (isRate && 'work_ref' in props.item) {
      toggle(props.item.id, { parentId: props.item.work_ref.id, liked: view.value.liked })
    } else {
      toggle(props.item.id)
    }
  }

  const commentCount = computed(() =>
    'comment_count' in props.item ? props.item.comment_count : null,
  )
  const canShare = !['galgame_status', 'light_novel_status', 'manga_status'].includes(
    props.item.type,
  )
  const commentTo = computed(() => {
    switch (props.item.type) {
      case 'post':
        return `/posts/${props.item.id}`
      case 'article':
        return `/articles/${props.item.id}`
      default:
        return null
    }
  })
  const shareTo = computed(() => feedItemPath(props.item))

  const favoriteTarget = computed<{
    type: FavoriteEntityType
    id: number
    pickerTitle: string
  } | null>(() => {
    switch (props.item.type) {
      case 'post':
        return {
          type: 'post',
          id: props.item.id,
          pickerTitle: `将这篇${props.item.cover_count > 0 ? '图文' : '短文'}添加到收藏夹`,
        }
      case 'article':
        return {
          type: 'article',
          id: props.item.id,
          pickerTitle: `将这篇${props.item.is_review ? '长评' : '文章'}添加到收藏夹`,
        }
      case 'galgame_rate':
        return {
          type: 'galgame',
          id: props.item.work_ref.id,
          pickerTitle: `将「${props.item.work_ref.title}」添加到收藏夹`,
        }
      case 'manga_rate':
        return {
          type: 'manga',
          id: props.item.work_ref.id,
          pickerTitle: `将「${props.item.work_ref.title}」添加到收藏夹`,
        }
      case 'light_novel_rate':
      case 'light_novel_volume_rate':
        return {
          type: 'light_novel',
          id: props.item.work_ref.id,
          pickerTitle: `将「${props.item.work_ref.title}」添加到收藏夹`,
        }
      default:
        return null
    }
  })

  const initialFavorited = computed(() =>
    'favorited' in props.item ? props.item.favorited : false,
  )

  async function comment() {
    if (!commentTo.value) return
    await navigateTo({ path: commentTo.value, hash: COMMENT_SECTION_HASH })
    requestCommentFocus()
  }

  const btn = 'relative z-1'
</script>

<template>
  <Inline gap="xl" class="pt-1">
    <Button
      login-required
      v-if="canLike"
      variant="ghost"
      :tone="view.liked ? 'accent' : 'neutral'"
      size="sm"
      :loading="busy"
      :disabled="busy"
      aria-label="赞"
      :class="btn"
      @click="like"
    >
      <template #icon><InteractionLikeIcon :active="view.liked" /></template>
      {{ view.like_count }}
    </Button>
    <Button
      v-if="commentCount != null"
      variant="ghost"
      tone="neutral"
      size="sm"
      :icon-only="commentCount === 0"
      :class="btn"
      aria-label="评论"
      @click="comment"
    >
      <template #icon><MessageSquare /></template>
      <template v-if="commentCount > 0" #default>{{ commentCount }}</template>
    </Button>
    <FavoriteToggle
      v-if="favoriteTarget"
      :id="favoriteTarget.id"
      :type="favoriteTarget.type"
      :initial-favorited="initialFavorited"
      variant="bar"
      size="sm"
      :picker-title="favoriteTarget.pickerTitle"
      :class="btn"
    />
    <ShareButton
      v-if="canShare && shareTo"
      :to="shareTo"
      size="sm"
      aria-label="转发"
      :class="btn"
    />
  </Inline>
</template>
