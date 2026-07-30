<script setup lang="ts">
  import { Pencil } from '@lucide/vue'
  import type { PostPageData } from '~~/server/api/pages/posts/[id].get'
  import { usePostOwnerActions } from '~/features/post/usePostOwnerActions'
  import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

  const props = defineProps<{
    author: PostPageData['author']
    stats: PostPageData['author_stats']
    creator: NonNullable<PostPageData['post']['creator']>
    createdAt: string
    postId: number
  }>()

  const auth = useAuthStore()
  const { edit } = usePostOwnerActions()
  const isOwner = computed(() => auth.user?.id != null && auth.user.id === props.creator.id)

  const dateLabel = computed(() => datePartFormat(props.createdAt, TimeFormatEnum.YYYY_M_D_CN))
  const meta = computed(() =>
    props.stats
      ? `${props.stats.post_count} 篇图文 · 玩过 ${props.stats.played_count} 部 · 看过 ${props.stats.read_count} 部`
      : '',
  )
</script>

<template>
  <div class="flex items-center gap-3">
    <Avatar :user="creator" card shape="circle" class="size-11! shrink-0" />
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <div class="flex items-center gap-2 text-sm">
        <UserName :user="creator" class="font-semibold text-color" />
        <UserBadges :user="creator" />
        <span class="text-muted-color">·</span>
        <time class="text-[13px] text-muted-color" :datetime="createdAt">{{ dateLabel }}</time>
      </div>
      <span v-if="meta" class="text-xs text-muted-color">{{ meta }}</span>
    </div>
    <Button v-if="isOwner" label="编辑" size="small" severity="secondary" @click="edit(postId)">
      <template #icon><Pencil class="size-4" /></template>
    </Button>
    <CommunityFollowButton
      v-else
      :user-id="creator.id"
      :initial-following="author?.is_following ?? false"
    />
  </div>
</template>
