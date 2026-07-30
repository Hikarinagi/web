<script setup lang="ts">
  import { MessageSquare } from '@lucide/vue'
  import { COMMENT_SECTION_HASH, requestCommentFocus } from '~/features/comment/comment'
  import type { FavoriteEntityType } from '~/features/favorite/entity'
  import type { BackendFeedItem } from '~/features/feed/feed'
  import { useLike, useLikeView } from '~/features/interaction/useLike'

  const props = defineProps<{ item: BackendFeedItem }>()

  const LIKEABLE = ['post', 'article', 'galgame_rate', 'light_novel_rate', 'manga_rate']
  const canLike = LIKEABLE.includes(props.item.type)
  const kind = (canLike ? props.item.type : 'post') as
    | 'post'
    | 'article'
    | 'galgame_rate'
    | 'light_novel_rate'
    | 'manga_rate'
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
  const shareTo = computed(() => {
    switch (props.item.type) {
      case 'post':
        return `/posts/${props.item.id}`
      case 'article':
        return `/articles/${props.item.id}`
      case 'galgame_rate':
        return `/galgames/${props.item.work_ref.id}`
      case 'manga_rate':
        return `/mangas/${props.item.work_ref.id}`
      case 'light_novel_rate':
      case 'light_novel_volume_rate':
        return `/light-novels/${props.item.work_ref.id}`
      default:
        return null
    }
  })

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

  const btn =
    'relative z-1 -mx-2 -my-1 w-auto! gap-1.5! px-2! py-1! hover:bg-transparent! active:bg-transparent! hover:text-color!'
</script>

<template>
  <div class="flex items-center gap-10 pt-1 text-muted-color">
    <Button
      v-if="canLike"
      login-required
      text
      size="small"
      :severity="view.liked ? undefined : 'secondary'"
      :loading="busy"
      :disabled="busy"
      :label="view.like_count.toString()"
      class="relative z-1 -mx-2 -my-1 gap-1.5! px-2! py-1! hover:bg-transparent! active:bg-transparent!"
      :class="{ 'hover:text-color!': !view.liked }"
      aria-label="赞"
      @click="like"
    >
      <template #icon><InteractionLikeIcon :active="view.liked" /></template>
    </Button>
    <Button
      v-if="commentCount != null"
      text
      size="small"
      severity="secondary"
      :label="commentCount > 0 ? commentCount.toString() : undefined"
      :class="btn"
      aria-label="评论"
      @click="comment"
    >
      <template #icon><MessageSquare class="size-[1em]" /></template>
    </Button>
    <FavoriteToggle
      v-if="favoriteTarget"
      :id="favoriteTarget.id"
      :type="favoriteTarget.type"
      :initial-favorited="initialFavorited"
      variant="bar"
      size="small"
      :picker-title="favoriteTarget.pickerTitle"
      :class="btn"
    />
    <ShareButton
      v-if="canShare && shareTo"
      :to="shareTo"
      text
      size="small"
      severity="secondary"
      aria-label="转发"
      :class="btn"
    />
  </div>
</template>
